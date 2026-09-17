import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { ReturnDueCustomer } from '../../../domain/entities/return-due-customer.entity';
import {
  IReturnDueReader,
  ReturnDueFilters,
} from '../../../domain/repositories/return-due-reader.interface';

interface ReturnDueRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  branch_id: string;
  visit_count: number;
  last_visit_at: Date;
  days_since_last_visit: number;
}

/**
 * Sonuncu prosedur tarixi verilmiş aralıqda qalan müştəriləri qaytarır.
 * Ən "gecikmiş" müştəri (ən köhnə son vizit) əvvəldə gəlir.
 */
@Injectable()
export class PrismaReturnDueReader implements IReturnDueReader {
  constructor(private readonly prisma: PrismaService) {}

  async findDueForReturn(
    filters: ReturnDueFilters,
  ): Promise<PaginatedResult<ReturnDueCustomer>> {
    const { skip, take } = toPrismaSkipTake(filters.pagination);

    const branchFilter = filters.branchId
      ? Prisma.sql`WHERE c.branch_id = ${filters.branchId}::uuid`
      : Prisma.empty;

    const minDaysFilter = Prisma.sql`MAX(p.date) <= NOW() - (${filters.minDays}::int * INTERVAL '1 day')`;
    const maxDaysFilter =
      filters.maxDays !== null
        ? Prisma.sql`AND MAX(p.date) >= NOW() - (${filters.maxDays}::int * INTERVAL '1 day')`
        : Prisma.empty;

    const limitSql =
      take !== undefined ? Prisma.sql`LIMIT ${take}` : Prisma.empty;
    const offsetSql =
      skip !== undefined ? Prisma.sql`OFFSET ${skip}` : Prisma.empty;

    const [rows, countRows] = await this.prisma.$transaction([
      this.prisma.$queryRaw<ReturnDueRow[]>`
        SELECT
          c.id,
          c.first_name,
          c.last_name,
          c.phone,
          c.branch_id,
          c.visit_count,
          MAX(p.date) AS last_visit_at,
          (CURRENT_DATE - MAX(p.date)::date)::int AS days_since_last_visit
        FROM customers c
        JOIN procedures p ON p.customer_id = c.id
        ${branchFilter}
        GROUP BY c.id, c.first_name, c.last_name, c.phone, c.branch_id, c.visit_count
        HAVING ${minDaysFilter}
        ${maxDaysFilter}
        ORDER BY MAX(p.date) ASC
        ${limitSql}
        ${offsetSql}
      `,
      this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*)::int AS count FROM (
          SELECT c.id
          FROM customers c
          JOIN procedures p ON p.customer_id = c.id
          ${branchFilter}
          GROUP BY c.id
          HAVING ${minDaysFilter}
          ${maxDaysFilter}
        ) AS due_customers
      `,
    ]);

    const total = countRows[0]?.count ?? 0;

    return createPaginatedResult(
      rows.map(
        (row) =>
          new ReturnDueCustomer(
            row.id,
            row.first_name,
            row.last_name,
            row.phone,
            row.branch_id,
            new Date(row.last_visit_at),
            Number(row.days_since_last_visit),
            Number(row.visit_count),
          ),
      ),
      total,
      filters.pagination,
    );
  }
}
