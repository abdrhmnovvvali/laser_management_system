import { Injectable } from '@nestjs/common';
import { Locale as PrismaLocale, Prisma } from '@prisma/client';
import { BusinessRuleViolationException } from '../../../../../shared/kernel/domain.exception';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { Zone } from '../../../domain/entities/zone.entity';
import {
  CreateZoneData,
  IZoneRepository,
  UpdateZoneData,
  ZoneListOptions,
  ZoneTranslationInput,
} from '../../../domain/repositories/zone.repository.interface';
import { Locale } from '../../../../../shared/i18n/locale.enum';
import { ZonePersistenceMapper } from '../../mappers/zone-persistence.mapper';

const translationsInclude = {
  translations: true,
} as const;

@Injectable()
export class PrismaZoneRepository implements IZoneRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: ZoneListOptions): Promise<PaginatedResult<Zone>> {
    const { skip, take } = toPrismaSkipTake(options?.pagination);
    const where: Prisma.ZoneWhereInput = options?.deviceId
      ? { deviceId: options.deviceId }
      : {};

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.zone.findMany({
        where,
        include: translationsInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.zone.count({ where }),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      options?.pagination,
    );
  }

  async findById(id: string): Promise<Zone | null> {
    const row = await this.prisma.zone.findUnique({
      where: { id },
      include: translationsInclude,
    });
    return row ? this.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Zone[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.prisma.zone.findMany({
      where: { id: { in: ids } },
      include: translationsInclude,
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findByNames(names: string[]): Promise<Zone[]> {
    const normalized = [
      ...new Set(names.map((name) => name.trim()).filter(Boolean)),
    ];
    if (normalized.length === 0) {
      return [];
    }

    const translationRows = await this.prisma.zoneTranslation.findMany({
      where: {
        OR: normalized.map((name) => ({
          name: { contains: name, mode: 'insensitive' as const },
        })),
      },
      select: { zoneId: true },
    });

    const zoneIds = [...new Set(translationRows.map((row) => row.zoneId))];
    if (zoneIds.length === 0) {
      return [];
    }

    return this.findByIds(zoneIds);
  }

  async create(data: CreateZoneData): Promise<Zone> {
    const created = await this.prisma.zone.create({
      data: {
        deviceId: data.deviceId,
        price: data.price,
        translations: {
          create: data.translations.map((item) => ({
            locale: item.locale as PrismaLocale,
            name: item.name,
          })),
        },
      },
      include: translationsInclude,
    });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateZoneData): Promise<Zone> {
    if (data.price !== undefined) {
      await this.prisma.zone.update({
        where: { id },
        data: { price: data.price },
      });
    }

    if (data.translations) {
      await this.replaceTranslations(id, data.translations);
    }

    const zone = await this.findById(id);
    if (!zone) {
      throw new Error('Zone update sonrası tapılmadı');
    }
    return zone;
  }

  async delete(id: string): Promise<void> {
    const procedureZonesCount = await this.prisma.procedureZone.count({
      where: { zoneId: id },
    });
    if (procedureZonesCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu zona prosedurlarda istifadə edildiyi üçün silinə bilməz.',
      );
    }

    const campaignZonesCount = await this.prisma.campaignZone.count({
      where: { zoneId: id },
    });
    if (campaignZonesCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu zona kampaniyalarda istifadə edildiyi üçün silinə bilməz.',
      );
    }

    const followUpZonesCount = await this.prisma.followUpZone.count({
      where: { zoneId: id },
    });
    if (followUpZonesCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu zona rezervasiyalarda istifadə edildiyi üçün silinə bilməz.',
      );
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.packageZone.deleteMany({ where: { zoneId: id } });
        await tx.zoneTranslation.deleteMany({ where: { zoneId: id } });
        await tx.zone.delete({ where: { id } });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BusinessRuleViolationException(
          'Bu zona digər qeydlərə bağlı olduğu üçün silinə bilməz.',
        );
      }
      throw error;
    }
  }

  private async replaceTranslations(
    zoneId: string,
    translations: ZoneTranslationInput[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.zoneTranslation.deleteMany({ where: { zoneId } }),
      this.prisma.zoneTranslation.createMany({
        data: translations.map((item) => ({
          zoneId,
          locale: item.locale as PrismaLocale,
          name: item.name,
        })),
      }),
    ]);
  }

  private toDomain(row: {
    id: string;
    deviceId: string;
    price: Prisma.Decimal;
    createdAt: Date;
    translations: Array<{ locale: PrismaLocale; name: string }>;
  }): Zone {
    return ZonePersistenceMapper.toDomain({
      id: row.id,
      device_id: row.deviceId,
      price: Number(row.price),
      created_at: row.createdAt.toISOString(),
      zone_translations: row.translations.map((item) => ({
        locale: item.locale as Locale,
        name: item.name,
      })),
    });
  }
}
