import { Injectable } from '@nestjs/common';
import { Gender as PrismaGender, Prisma } from '@prisma/client';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { Customer } from '../../../domain/entities/customer.entity';
import {
  CreateCustomerData,
  CustomerFilters,
  ICustomerRepository,
  UpdateCustomerData,
} from '../../../domain/repositories/customer.repository.interface';
import { Gender } from '../../../domain/entities/gender.enum';
import { CustomerPersistenceMapper } from '../../mappers/customer-persistence.mapper';

function toDateOnly(date: Date): Date {
  return new Date(date.toISOString().slice(0, 10));
}

@Injectable()
export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: CustomerFilters): Promise<PaginatedResult<Customer>> {
    const where = await this.buildWhere(filters);
    if (where === null) {
      return createPaginatedResult([], 0, filters.pagination);
    }

    const { skip, take } = toPrismaSkipTake(filters.pagination);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { procedures: true },
          },
        },
        orderBy: { registeredAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      filters.pagination,
    );
  }

  async count(filters: Omit<CustomerFilters, 'pagination'>): Promise<number> {
    const where = await this.buildWhere(filters);
    if (where === null) {
      return 0;
    }
    return this.prisma.customer.count({ where });
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { procedures: true },
        },
      },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Customer[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.prisma.customer.findMany({
      where: { id: { in: ids } },
      include: {
        _count: {
          select: { procedures: true },
        },
      },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async create(data: CreateCustomerData): Promise<Customer> {
    const row = await this.prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? null,
        birthDate: data.birthDate ? toDateOnly(data.birthDate) : null,
        gender: (data.gender as PrismaGender | null | undefined) ?? null,
        branchId: data.branchId,
        visitCount: data.visitCount ?? 0,
      },
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateCustomerData): Promise<Customer> {
    const payload: Prisma.CustomerUpdateInput = {};
    if (data.firstName !== undefined) payload.firstName = data.firstName;
    if (data.lastName !== undefined) payload.lastName = data.lastName;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.birthDate !== undefined) {
      payload.birthDate = data.birthDate ? toDateOnly(data.birthDate) : null;
    }
    if (data.gender !== undefined) {
      payload.gender = data.gender as PrismaGender | null;
    }
    if (data.branchId !== undefined) {
      payload.branch = { connect: { id: data.branchId } };
    }
    if (data.visitCount !== undefined) {
      payload.visitCount = data.visitCount;
    }

    const row = await this.prisma.customer.update({
      where: { id },
      data: payload,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({ where: { id } });
  }

  private async buildWhere(
    filters: Omit<CustomerFilters, 'pagination'>,
  ): Promise<Prisma.CustomerWhereInput | null> {
    const where: Prisma.CustomerWhereInput = {};

    if (filters.branchId) {
      where.branchId = filters.branchId;
    }
    if (filters.gender) {
      where.gender = filters.gender as PrismaGender;
    }

    if (filters.zoneId) {
      const zoneCustomerIds = await this.findCustomerIdsByZone(filters.zoneId);
      if (zoneCustomerIds.length === 0) {
        return null;
      }
      where.id = { in: zoneCustomerIds };
    }

    const searchWhere = this.buildSearchWhere(filters.search);
    if (searchWhere) {
      where.AND = [...(Array.isArray(where.AND) ? where.AND : []), searchWhere];
    }

    return where;
  }

  private buildSearchWhere(
    search?: string,
  ): Prisma.CustomerWhereInput | undefined {
    const term = search?.trim();
    if (!term) {
      return undefined;
    }

    const parts = term.split(/\s+/).filter(Boolean);

    if (parts.length <= 1) {
      return {
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { phone: { contains: term, mode: 'insensitive' } },
        ],
      };
    }

    const first = parts[0];
    const rest = parts.slice(1).join(' ');

    return {
      OR: [
        {
          AND: [
            { firstName: { contains: first, mode: 'insensitive' } },
            { lastName: { contains: rest, mode: 'insensitive' } },
          ],
        },
        {
          AND: [
            { firstName: { contains: rest, mode: 'insensitive' } },
            { lastName: { contains: first, mode: 'insensitive' } },
          ],
        },
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ],
    };
  }

  private async findCustomerIdsByZone(zoneId: string): Promise<string[]> {
    const rows = await this.prisma.procedureZone.findMany({
      where: { zoneId },
      select: {
        procedure: {
          select: { customerId: true },
        },
      },
    });

    return [
      ...new Set(rows.map((row) => row.procedure.customerId).filter(Boolean)),
    ];
  }

  private toDomain(row: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    birthDate: Date | null;
    gender: PrismaGender | null;
    branchId: string;
    visitCount?: number;
    registeredAt: Date;
    _count?: { procedures?: number };
  }): Customer {
    const baseCount = row.visitCount ?? 0;
    const procedureCount = row._count?.procedures ?? 0;
    return CustomerPersistenceMapper.toDomain({
      id: row.id,
      first_name: row.firstName,
      last_name: row.lastName,
      phone: row.phone,
      birth_date: row.birthDate ? row.birthDate.toISOString() : null,
      gender: row.gender as Gender | null,
      branch_id: row.branchId,
      registered_at: row.registeredAt.toISOString(),
      visit_count: baseCount + procedureCount,
    });
  }
}
