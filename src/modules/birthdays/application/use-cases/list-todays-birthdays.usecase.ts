import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import { BIRTHDAY_READER } from '../../domain/repositories/birthday-reader.interface';
import type { IBirthdayReader } from '../../domain/repositories/birthday-reader.interface';

@Injectable()
export class ListTodaysBirthdaysUseCase {
  constructor(
    @Inject(BIRTHDAY_READER)
    private readonly birthdayReader: IBirthdayReader,
  ) {}

  async execute(
    query?: PaginationQueryDto,
    options?: { skipPagination?: boolean },
  ) {
    return this.birthdayReader.findTodaysBirthdays({
      pagination:
        options?.skipPagination || !query
          ? undefined
          : resolvePagination(query),
    });
  }
}
