import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { Procedure } from '../../../domain/entities/procedure.entity';
import {
  CreateProcedureData,
  IProcedureRepository,
  ProcedureFilters,
  UpdateProcedureData,
} from '../../../domain/repositories/procedure.repository.interface';
import { ProcedurePersistenceMapper } from '../../mappers/procedure-persistence.mapper';

const zonesInclude = {
  procedureZones: true,
} as const;

@Injectable()
export class PrismaProcedureRepository implements IProcedureRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: ProcedureFilters): Promise<PaginatedResult<Procedure>> {
    const where = await this.buildWhere(filters);
    if (where === null) {
      return createPaginatedResult([], 0, filters.pagination);
    }

    const { skip, take } = toPrismaSkipTake(filters.pagination);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.procedure.findMany({
        where,
        include: zonesInclude,
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      this.prisma.procedure.count({ where }),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      filters.pagination,
    );
  }

  async findById(id: string): Promise<Procedure | null> {
    const row = await this.prisma.procedure.findUnique({
      where: { id },
      include: zonesInclude,
    });
    return row ? this.toDomain(row) : null;
  }

  async countByCustomerId(customerId: string): Promise<number> {
    return this.prisma.procedure.count({ where: { customerId } });
  }

  async create(data: CreateProcedureData): Promise<Procedure> {
    const created = await this.prisma.procedure.create({
      data: {
        customerId: data.customerId,
        deviceId: data.deviceId,
        packageId: data.packageId,
        campaignId: data.campaignId ?? null,
        date: data.date,
        declaredShotCount: data.declaredShotCount,
        actualShotCount: data.actualShotCount,
        price: data.price,
        freeZoneId: data.freeZoneId ?? null,
        discountAmount: data.discountAmount ?? 0,
        visitNumber: data.visitNumber ?? null,
        procedureZones: {
          create: data.zoneIds.map((zoneId) => ({ zoneId })),
        },
      },
      include: zonesInclude,
    });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateProcedureData): Promise<Procedure> {
    const payload: Prisma.ProcedureUpdateInput = {};
    if (data.date !== undefined) payload.date = data.date;
    if (data.declaredShotCount !== undefined) {
      payload.declaredShotCount = data.declaredShotCount;
    }
    if (data.actualShotCount !== undefined) {
      payload.actualShotCount = data.actualShotCount;
    }

    await this.prisma.procedure.update({ where: { id }, data: payload });

    const procedure = await this.findById(id);
    if (!procedure) {
      throw new Error('Procedure update sonrası tapılmadı');
    }
    return procedure;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.procedure.delete({ where: { id } });
  }

  private async buildWhere(
    filters: ProcedureFilters,
  ): Promise<Prisma.ProcedureWhereInput | null> {
    const where: Prisma.ProcedureWhereInput = {};

    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.deviceId) where.deviceId = filters.deviceId;
    if (filters.packageId) where.packageId = filters.packageId;
    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.visitNumber !== undefined) {
      where.visitNumber = filters.visitNumber;
    }
    if (filters.declaredShotCount !== undefined) {
      where.declaredShotCount = filters.declaredShotCount;
    }
    if (filters.actualShotCount !== undefined) {
      where.actualShotCount = filters.actualShotCount;
    }
    if (filters.difference !== undefined) {
      where.shotCountDifference = filters.difference;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = filters.dateFrom;
      if (filters.dateTo) where.date.lte = filters.dateTo;
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }
    if (filters.branchId) {
      where.customer = { branchId: filters.branchId };
    }

    if (filters.zoneIds?.length) {
      const procedureIds = await this.findProcedureIdsByZoneIds(filters.zoneIds);
      if (procedureIds.length === 0) {
        return null;
      }
      where.id = { in: procedureIds };
    }

    return where;
  }

  private async findProcedureIdsByZoneIds(zoneIds: string[]): Promise<string[]> {
    const [junctionRows, freeZoneRows] = await Promise.all([
      this.prisma.procedureZone.findMany({
        where: { zoneId: { in: zoneIds } },
        select: { procedureId: true },
      }),
      this.prisma.procedure.findMany({
        where: { freeZoneId: { in: zoneIds } },
        select: { id: true },
      }),
    ]);

    return [
      ...new Set([
        ...junctionRows.map((row) => row.procedureId),
        ...freeZoneRows.map((row) => row.id),
      ]),
    ];
  }

  private toDomain(row: {
    id: string;
    customerId: string;
    deviceId: string;
    packageId: string | null;
    campaignId: string | null;
    date: Date;
    declaredShotCount: number;
    actualShotCount: number;
    price: Prisma.Decimal;
    createdAt: Date;
    freeZoneId: string | null;
    discountAmount: Prisma.Decimal;
    visitNumber: number | null;
    procedureZones: Array<{ zoneId: string }>;
  }): Procedure {
    return ProcedurePersistenceMapper.toDomain({
      id: row.id,
      customer_id: row.customerId,
      device_id: row.deviceId,
      package_id: row.packageId,
      campaign_id: row.campaignId,
      date: row.date.toISOString(),
      declared_shot_count: row.declaredShotCount,
      actual_shot_count: row.actualShotCount,
      price: Number(row.price),
      created_at: row.createdAt.toISOString(),
      free_zone_id: row.freeZoneId,
      discount_amount: Number(row.discountAmount),
      visit_number: row.visitNumber,
      procedure_zones: row.procedureZones.map((item) => ({
        zone_id: item.zoneId,
      })),
    });
  }
}
