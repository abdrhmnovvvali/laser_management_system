import { Injectable } from '@nestjs/common';
import {
  DiscountType as PrismaDiscountType,
  Locale as PrismaLocale,
  Prisma,
} from '@prisma/client';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { Campaign } from '../../../domain/entities/campaign.entity';
import {
  CampaignListOptions,
  CampaignTranslationInput,
  CreateCampaignData,
  ICampaignRepository,
  UpdateCampaignData,
} from '../../../domain/repositories/campaign.repository.interface';
import { Locale } from '../../../../../shared/i18n/locale.enum';
import { DiscountType } from '../../../domain/entities/discount-type.enum';
import { CampaignPersistenceMapper } from '../../mappers/campaign-persistence.mapper';

const relationsInclude = {
  translations: true,
  campaignZones: true,
} as const;

function toDateOnly(date: Date): Date {
  return new Date(date.toISOString().slice(0, 10));
}

@Injectable()
export class PrismaCampaignRepository implements ICampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    options?: CampaignListOptions,
  ): Promise<PaginatedResult<Campaign>> {
    const { skip, take } = toPrismaSkipTake(options?.pagination);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.campaign.findMany({
        include: relationsInclude,
        orderBy: { startDate: 'desc' },
        skip,
        take,
      }),
      this.prisma.campaign.count(),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      options?.pagination,
    );
  }

  async findActive(
    onDate: Date,
    options?: CampaignListOptions,
  ): Promise<PaginatedResult<Campaign>> {
    const { skip, take } = toPrismaSkipTake(options?.pagination);
    const dateOnly = toDateOnly(onDate);
    const where: Prisma.CampaignWhereInput = {
      startDate: { lte: dateOnly },
      endDate: { gte: dateOnly },
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.campaign.findMany({
        where,
        include: relationsInclude,
        orderBy: { startDate: 'desc' },
        skip,
        take,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      options?.pagination,
    );
  }

  async findById(id: string): Promise<Campaign | null> {
    const row = await this.prisma.campaign.findUnique({
      where: { id },
      include: relationsInclude,
    });
    return row ? this.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Campaign[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.prisma.campaign.findMany({
      where: { id: { in: ids } },
      include: relationsInclude,
    });
    return rows.map((row) => this.toDomain(row));
  }

  async create(data: CreateCampaignData): Promise<Campaign> {
    const created = await this.prisma.campaign.create({
      data: {
        discountType: data.discountType as PrismaDiscountType,
        discountValue: data.discountValue,
        startDate: toDateOnly(data.startDate),
        endDate: toDateOnly(data.endDate),
        translations: {
          create: data.translations.map((item) => ({
            locale: item.locale as PrismaLocale,
            name: item.name,
            description: item.description ?? null,
          })),
        },
        campaignZones: {
          create: data.zoneIds.map((zoneId) => ({ zoneId })),
        },
      },
      include: relationsInclude,
    });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateCampaignData): Promise<Campaign> {
    const payload: Prisma.CampaignUpdateInput = {};
    if (data.discountType !== undefined) {
      payload.discountType = data.discountType as PrismaDiscountType;
    }
    if (data.discountValue !== undefined) {
      payload.discountValue = data.discountValue;
    }
    if (data.startDate !== undefined) {
      payload.startDate = toDateOnly(data.startDate);
    }
    if (data.endDate !== undefined) {
      payload.endDate = toDateOnly(data.endDate);
    }

    if (Object.keys(payload).length > 0) {
      await this.prisma.campaign.update({ where: { id }, data: payload });
    }

    if (data.translations) {
      await this.replaceTranslations(id, data.translations);
    }

    if (data.zoneIds) {
      await this.replaceZoneLinks(id, data.zoneIds);
    }

    const campaign = await this.findById(id);
    if (!campaign) {
      throw new Error('Campaign update sonrası tapılmadı');
    }
    return campaign;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.campaign.delete({ where: { id } });
  }

  private async replaceTranslations(
    campaignId: string,
    translations: CampaignTranslationInput[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.campaignTranslation.deleteMany({ where: { campaignId } }),
      this.prisma.campaignTranslation.createMany({
        data: translations.map((item) => ({
          campaignId,
          locale: item.locale as PrismaLocale,
          name: item.name,
          description: item.description ?? null,
        })),
      }),
    ]);
  }

  private async replaceZoneLinks(
    campaignId: string,
    zoneIds: string[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.campaignZone.deleteMany({ where: { campaignId } });
      if (zoneIds.length === 0) {
        return;
      }
      await tx.campaignZone.createMany({
        data: zoneIds.map((zoneId) => ({ campaignId, zoneId })),
      });
    });
  }

  private toDomain(row: {
    id: string;
    discountType: PrismaDiscountType;
    discountValue: Prisma.Decimal;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    translations: Array<{
      locale: PrismaLocale;
      name: string;
      description: string | null;
    }>;
    campaignZones: Array<{ zoneId: string }>;
  }): Campaign {
    return CampaignPersistenceMapper.toDomain({
      id: row.id,
      discount_type: row.discountType as DiscountType,
      discount_value: Number(row.discountValue),
      start_date: row.startDate.toISOString(),
      end_date: row.endDate.toISOString(),
      created_at: row.createdAt.toISOString(),
      campaign_translations: row.translations.map((item) => ({
        locale: item.locale as Locale,
        name: item.name,
        description: item.description,
      })),
      campaign_zones: row.campaignZones.map((item) => ({
        zone_id: item.zoneId,
      })),
    });
  }
}
