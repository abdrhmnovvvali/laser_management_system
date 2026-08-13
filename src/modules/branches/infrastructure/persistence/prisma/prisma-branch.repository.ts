import { Injectable } from '@nestjs/common';
import { Locale as PrismaLocale } from '@prisma/client';
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
    await this.prisma.branch.delete({ where: { id } });
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
