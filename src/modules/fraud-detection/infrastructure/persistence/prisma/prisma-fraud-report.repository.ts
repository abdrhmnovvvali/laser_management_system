import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { FraudReportItem } from '../../../domain/entities/fraud-report-item.entity';
import {
  FraudReportFilters,
  IFraudReportRepository,
} from '../../../domain/repositories/fraud-report.repository.interface';
import { FraudReportPersistenceMapper } from '../../mappers/fraud-report-persistence.mapper';

interface FraudReportViewRow {
  id: string;
  device_id: string;
  declared_shot_count: number;
  actual_shot_count: number;
  date: Date | string;
  customer_id: string;
  branch_id: string;
}

@Injectable()
export class PrismaFraudReportRepository implements IFraudReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMismatches(
    filters: FraudReportFilters,
  ): Promise<PaginatedResult<FraudReportItem>> {
    const { skip, take } = toPrismaSkipTake(filters.pagination);
    const conditions: Prisma.Sql[] = [];

    if (filters.deviceId) {
      conditions.push(Prisma.sql`device_id = ${filters.deviceId}::uuid`);
    }
    if (filters.branchId) {
      conditions.push(Prisma.sql`branch_id = ${filters.branchId}::uuid`);
    }

    const where =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    const limitSql =
      take !== undefined ? Prisma.sql`LIMIT ${take}` : Prisma.empty;
    const offsetSql =
      skip !== undefined ? Prisma.sql`OFFSET ${skip}` : Prisma.empty;

    const [rows, countRows] = await this.prisma.$transaction([
      this.prisma.$queryRaw<FraudReportViewRow[]>`
        SELECT * FROM fraud_report_view
        ${where}
        ORDER BY date DESC
        ${limitSql}
        ${offsetSql}
      `,
      this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*)::int AS count FROM fraud_report_view
        ${where}
      `,
    ]);

    const total = countRows[0]?.count ?? 0;

    return createPaginatedResult(
      rows.map((row) =>
        FraudReportPersistenceMapper.toDomain({
          id: row.id,
          device_id: row.device_id,
          declared_shot_count: Number(row.declared_shot_count),
          actual_shot_count: Number(row.actual_shot_count),
          date:
            row.date instanceof Date ? row.date.toISOString() : String(row.date),
          customer_id: row.customer_id,
          branch_id: row.branch_id,
        }),
      ),
      total,
      filters.pagination,
    );
  }
}
