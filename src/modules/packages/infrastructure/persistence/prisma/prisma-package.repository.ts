import { Injectable } from '@nestjs/common';
import { Locale as PrismaLocale, Prisma } from '@prisma/client';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { Package } from '../../../domain/entities/package.entity';
import {
  CreatePackageData,
  IPackageRepository,
  PackageListOptions,
  PackageTranslationInput,
  UpdatePackageData,
} from '../../../domain/repositories/package.repository.interface';
import { Locale } from '../../../../../shared/i18n/locale.enum';
import { PackagePersistenceMapper } from '../../mappers/package-persistence.mapper';

const relationsInclude = {
  translations: true,
  packageZones: true,
} as const;

@Injectable()
export class PrismaPackageRepository implements IPackageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    options?: PackageListOptions,
  ): Promise<PaginatedResult<Package>> {
    const { skip, take } = toPrismaSkipTake(options?.pagination);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.package.findMany({
        include: relationsInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.package.count(),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      options?.pagination,
    );
  }

  async findById(id: string): Promise<Package | null> {
    const row = await this.prisma.package.findUnique({
      where: { id },
      include: relationsInclude,
    });
    return row ? this.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Package[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.prisma.package.findMany({
      where: { id: { in: ids } },
      include: relationsInclude,
    });
    return rows.map((row) => this.toDomain(row));
  }

  async create(data: CreatePackageData): Promise<Package> {
    const created = await this.prisma.package.create({
      data: {
        price: data.price,
        translations: {
          create: data.translations.map((item) => ({
            locale: item.locale as PrismaLocale,
            name: item.name,
          })),
        },
        packageZones: {
          create: data.zoneIds.map((zoneId) => ({ zoneId })),
        },
      },
      include: relationsInclude,
    });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdatePackageData): Promise<Package> {
    if (data.price !== undefined) {
      await this.prisma.package.update({
        where: { id },
        data: { price: data.price },
      });
    }

    if (data.translations) {
      await this.replaceTranslations(id, data.translations);
    }

    if (data.zoneIds) {
      await this.replaceZoneLinks(id, data.zoneIds);
    }

    const pkg = await this.findById(id);
    if (!pkg) {
      throw new Error('Package update sonrası tapılmadı');
    }
    return pkg;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.package.delete({ where: { id } });
  }

  private async replaceTranslations(
    packageId: string,
    translations: PackageTranslationInput[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.packageTranslation.deleteMany({ where: { packageId } }),
      this.prisma.packageTranslation.createMany({
        data: translations.map((item) => ({
          packageId,
          locale: item.locale as PrismaLocale,
          name: item.name,
        })),
      }),
    ]);
  }

  private async replaceZoneLinks(
    packageId: string,
    zoneIds: string[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.packageZone.deleteMany({ where: { packageId } });
      if (zoneIds.length === 0) {
        return;
      }
      await tx.packageZone.createMany({
        data: zoneIds.map((zoneId) => ({ packageId, zoneId })),
      });
    });
  }

  private toDomain(row: {
    id: string;
    price: Prisma.Decimal;
    createdAt: Date;
    translations: Array<{ locale: PrismaLocale; name: string }>;
    packageZones: Array<{ zoneId: string }>;
  }): Package {
    return PackagePersistenceMapper.toDomain({
      id: row.id,
      price: Number(row.price),
      created_at: row.createdAt.toISOString(),
      package_translations: row.translations.map((item) => ({
        locale: item.locale as Locale,
        name: item.name,
      })),
      package_zones: row.packageZones.map((item) => ({
        zone_id: item.zoneId,
      })),
    });
  }
}
