import { Injectable } from '@nestjs/common';
import { Locale as PrismaLocale, Prisma } from '@prisma/client';
import { BusinessRuleViolationException } from '../../../../../shared/kernel/domain.exception';
import {
  createPaginatedResult,
} from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { Branch } from '../../../domain/entities/branch.entity';
import {
  BranchListOptions,
  BranchTranslationInput,
  CreateBranchData,
  IBranchRepository,
  UpdateBranchData,
} from '../../../domain/repositories/branch.repository.interface';
import { Locale } from '../../../../../shared/i18n/locale.enum';
import { BranchPersistenceMapper } from '../../mappers/branch-persistence.mapper';

const translationsInclude = {
  translations: true,
} as const;

@Injectable()
export class PrismaBranchRepository implements IBranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: BranchListOptions): Promise<PaginatedResult<Branch>> {
    const { skip, take } = toPrismaSkipTake(options?.pagination);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.branch.findMany({
        include: translationsInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.branch.count(),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      options?.pagination,
    );
  }

  async findById(id: string): Promise<Branch | null> {
    const row = await this.prisma.branch.findUnique({
      where: { id },
      include: translationsInclude,
    });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateBranchData): Promise<Branch> {
    const created = await this.prisma.branch.create({
      data: {
        translations: {
          create: data.translations.map((item) => ({
            locale: item.locale as PrismaLocale,
            name: item.name,
            address: item.address ?? null,
          })),
        },
      },
      include: translationsInclude,
    });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateBranchData): Promise<Branch> {
    if (data.translations) {
      await this.replaceTranslations(id, data.translations);
    }

    const branch = await this.findById(id);
    if (!branch) {
      throw new Error('Branch update sonrası tapılmadı');
    }
    return branch;
  }

  async delete(id: string): Promise<void> {
    // 1. Filiala bağlı müştərilərin yoxlanılması
    const customersCount = await this.prisma.customer.count({
      where: { branchId: id },
    });
    if (customersCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu filiala bağlı müştərilər mövcuddur. Əvvəlcə müştəriləri başqa filiala keçirin və ya silin.',
      );
    }

    // 2. Filiala təyin edilmiş işçilərin (staff) yoxlanılması
    const usersCount = await this.prisma.user.count({
      where: { branchId: id },
    });
    if (usersCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu filiala təyin edilmiş işçilər (istifadəçilər) mövcuddur. Əvvəlcə onların filialını dəyişin və ya silin.',
      );
    }

    // 3. Filialın cihazlarına bağlı prosedurların yoxlanılması
    const proceduresCount = await this.prisma.procedure.count({
      where: { device: { branchId: id } },
    });
    if (proceduresCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu filialın cihazlarında icra edilmiş prosedurlar mövcuddur. Filial silinə bilməz.',
      );
    }

    // 4. Filialın cihazlarına bağlı rezervasiyaların yoxlanılması
    const followUpsCount = await this.prisma.followUp.count({
      where: { device: { branchId: id } },
    });
    if (followUpsCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu filialın cihazlarına bağlı aktiv rezervasiyalar mövcuddur. Filial silinə bilməz.',
      );
    }

    // 5. Filialın cihazlarının zonalarının kampaniyalarda/prosedurlarda istifadə edilməsinin yoxlanılması
    const campaignZonesCount = await this.prisma.campaignZone.count({
      where: { zone: { device: { branchId: id } } },
    });
    if (campaignZonesCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu filialın cihazlarının zonaları kampaniyalarda istifadə edildiyi üçün filial silinə bilməz.',
      );
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // Filiala aid cihazları və zonaları tapırıq
        const branchDevices = await tx.device.findMany({
          where: { branchId: id },
          select: { id: true },
        });
        const deviceIds = branchDevices.map((d) => d.id);

        if (deviceIds.length > 0) {
          const deviceZones = await tx.zone.findMany({
            where: { deviceId: { in: deviceIds } },
            select: { id: true },
          });
          const zoneIds = deviceZones.map((z) => z.id);

          if (zoneIds.length > 0) {
            await tx.packageZone.deleteMany({
              where: { zoneId: { in: zoneIds } },
            });
            await tx.zoneTranslation.deleteMany({
              where: { zoneId: { in: zoneIds } },
            });
            await tx.zone.deleteMany({
              where: { deviceId: { in: deviceIds } },
            });
          }

          await tx.deviceTranslation.deleteMany({
            where: { deviceId: { in: deviceIds } },
          });
          await tx.device.deleteMany({
            where: { branchId: id },
          });
        }

        await tx.branchTranslation.deleteMany({
          where: { branchId: id },
        });

        await tx.branch.delete({
          where: { id },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BusinessRuleViolationException(
          'Bu filial digər qeydlərə bağlı olduğu üçün silinə bilməz.',
        );
      }
      throw error;
    }
  }

  private async replaceTranslations(
    branchId: string,
    translations: BranchTranslationInput[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.branchTranslation.deleteMany({ where: { branchId } }),
      this.prisma.branchTranslation.createMany({
        data: translations.map((item) => ({
          branchId,
          locale: item.locale as PrismaLocale,
          name: item.name,
          address: item.address ?? null,
        })),
      }),
    ]);
  }

  private toDomain(row: {
    id: string;
    createdAt: Date;
    translations: Array<{
      locale: PrismaLocale;
      name: string;
      address: string | null;
    }>;
  }): Branch {
    return BranchPersistenceMapper.toDomain({
      id: row.id,
      created_at: row.createdAt.toISOString(),
      branch_translations: row.translations.map((item) => ({
        locale: item.locale as Locale,
        name: item.name,
        address: item.address,
      })),
    });
  }
}
