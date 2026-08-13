import { Prisma } from '@prisma/client';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { BirthdayCustomer } from '../../../domain/entities/birthday-customer.entity';
import {
  BirthdayListOptions,
  IBirthdayReader,
} from '../../../domain/repositories/birthday-reader.interface';
import { BirthdayPersistenceMapper } from '../../mappers/birthday-persistence.mapper';

interface BirthdayViewRow {
  id: string;
  first_name: string;
  last_name: string;
  branch_id: string;
  birth_date: Date | string;
}

/**
 * Shared query logic for birthday readers — both inject PrismaService.
 */
export abstract class BasePrismaBirthdayReader implements IBirthdayReader {
  protected abstract readonly prisma: PrismaService;

  async findTodaysBirthdays(
    options?: BirthdayListOptions,
  ): Promise<PaginatedResult<BirthdayCustomer>> {
    const { skip, take } = toPrismaSkipTake(options?.pagination);

    const limitSql =
      take !== undefined ? Prisma.sql`LIMIT ${take}` : Prisma.empty;
    const offsetSql =
      skip !== undefined ? Prisma.sql`OFFSET ${skip}` : Prisma.empty;

    const [rows, countRows] = await this.prisma.$transaction([
      this.prisma.$queryRaw<BirthdayViewRow[]>`
        SELECT * FROM todays_birthdays_view
        ${limitSql}
        ${offsetSql}
      `,
      this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*)::int AS count FROM todays_birthdays_view
      `,
    ]);

    const total = countRows[0]?.count ?? 0;

    return createPaginatedResult(
      rows.map((row) =>
        BirthdayPersistenceMapper.toDomain({
          id: row.id,
          first_name: row.first_name,
          last_name: row.last_name,
          branch_id: row.branch_id,
          birth_date:
            row.birth_date instanceof Date
              ? row.birth_date.toISOString()
              : String(row.birth_date),
        }),
      ),
      total,
      options?.pagination,
    );
  }
}
