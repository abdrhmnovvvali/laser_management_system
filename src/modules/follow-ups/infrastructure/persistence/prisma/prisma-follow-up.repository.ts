import { Injectable } from '@nestjs/common';
import { FollowUpStatus as PrismaFollowUpStatus, Prisma } from '@prisma/client';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { FollowUp } from '../../../domain/entities/follow-up.entity';
import { FollowUpStatus } from '../../../domain/entities/follow-up-status.enum';
import {
  CreateFollowUpData,
  FollowUpListOptions,
  IFollowUpRepository,
  UpcomingFollowUpListOptions,
  UpdateFollowUpData,
} from '../../../domain/repositories/follow-up.repository.interface';
import { FollowUpPersistenceMapper } from '../../mappers/follow-up-persistence.mapper';

const zonesInclude = {
  zones: true,
} as const;

function toDateOnly(date: Date): Date {
  return new Date(date.toISOString().slice(0, 10));
}

@Injectable()
export class PrismaFollowUpRepository implements IFollowUpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    options: FollowUpListOptions,
  ): Promise<PaginatedResult<FollowUp>> {
    const { skip, take } = toPrismaSkipTake(options.pagination);
    const where: Prisma.FollowUpWhereInput = {};
    if (options.customerId) where.customerId = options.customerId;
    if (options.status) {
      where.status = options.status as PrismaFollowUpStatus;
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.followUp.findMany({
        where,
        include: zonesInclude,
        orderBy: { plannedDate: 'asc' },
        skip,
        take,
      }),
      this.prisma.followUp.count({ where }),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      options.pagination,
    );
  }

  async findById(id: string): Promise<FollowUp | null> {
    const row = await this.prisma.followUp.findUnique({
      where: { id },
      include: zonesInclude,
    });
    return row ? this.toDomain(row) : null;
  }

  async findUpcoming(
    options: UpcomingFollowUpListOptions,
  ): Promise<PaginatedResult<FollowUp>> {
    const today = new Date();
    const until = new Date();
    until.setDate(until.getDate() + options.days);

    const { skip, take } = toPrismaSkipTake(options.pagination);
    const where: Prisma.FollowUpWhereInput = {
      status: FollowUpStatus.PENDING as PrismaFollowUpStatus,
      plannedDate: {
        gte: toDateOnly(today),
        lte: toDateOnly(until),
      },
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.followUp.findMany({
        where,
        include: zonesInclude,
        orderBy: { plannedDate: 'asc' },
        skip,
        take,
      }),
      this.prisma.followUp.count({ where }),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      options.pagination,
    );
  }

  async findByStatus(status: FollowUpStatus): Promise<FollowUp[]> {
    const rows = await this.prisma.followUp.findMany({
      where: { status: status as PrismaFollowUpStatus },
      include: zonesInclude,
      orderBy: { plannedDate: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async create(data: CreateFollowUpData): Promise<FollowUp> {
    const created = await this.prisma.followUp.create({
      data: {
        customerId: data.customerId,
        plannedDate: toDateOnly(data.plannedDate),
        status: (data.status ?? FollowUpStatus.PENDING) as PrismaFollowUpStatus,
        zones: {
          create: (data.zoneIds ?? []).map((zoneId) => ({ zoneId })),
        },
      },
      include: zonesInclude,
    });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateFollowUpData): Promise<FollowUp> {
    const payload: Prisma.FollowUpUpdateInput = {};
    if (data.plannedDate !== undefined) {
      payload.plannedDate = toDateOnly(data.plannedDate);
    }
    if (data.status !== undefined) {
      payload.status = data.status as PrismaFollowUpStatus;
    }

    if (Object.keys(payload).length > 0) {
      await this.prisma.followUp.update({ where: { id }, data: payload });
    }

    if (data.zoneIds !== undefined) {
      await this.replaceZoneLinks(id, data.zoneIds);
    }

    const followUp = await this.findById(id);
    if (!followUp) {
      throw new Error('Follow-up update sonrası tapılmadı');
    }
    return followUp;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.followUp.delete({ where: { id } });
  }

  private async replaceZoneLinks(
    followUpId: string,
    zoneIds: string[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.followUpZone.deleteMany({ where: { followUpId } });
      if (zoneIds.length === 0) {
        return;
      }
      await tx.followUpZone.createMany({
        data: zoneIds.map((zoneId) => ({ followUpId, zoneId })),
      });
    });
  }

  private toDomain(row: {
    id: string;
    customerId: string;
    plannedDate: Date;
    status: PrismaFollowUpStatus;
    createdAt: Date;
    zones: Array<{ zoneId: string }>;
  }): FollowUp {
    return FollowUpPersistenceMapper.toDomain({
      id: row.id,
      customer_id: row.customerId,
      planned_date: row.plannedDate.toISOString(),
      status: row.status as FollowUpStatus,
      created_at: row.createdAt.toISOString(),
      follow_up_zones: row.zones.map((item) => ({ zone_id: item.zoneId })),
    });
  }
}
