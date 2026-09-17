import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { RETURN_DUE_READER } from '../../domain/repositories/return-due-reader.interface';
import type { IReturnDueReader } from '../../domain/repositories/return-due-reader.interface';
import {
  DEFAULT_MAX_DAYS,
  DEFAULT_MIN_DAYS,
  ListReturnDueQueryDto,
} from '../dto/list-return-due-query.dto';

@Injectable()
export class ListReturnDueCustomersUseCase {
  constructor(
    @Inject(RETURN_DUE_READER)
    private readonly returnDueReader: IReturnDueReader,
  ) {}

  async execute(query: ListReturnDueQueryDto) {
    const minDays = query.minDays ?? DEFAULT_MIN_DAYS;
    const requestedMaxDays = query.maxDays ?? DEFAULT_MAX_DAYS;
    // 0 → yuxarı hədd yoxdur; səhvən minDays-dən kiçik göndərilərsə hədd tətbiq olunmur.
    const maxDays =
      requestedMaxDays > 0 && requestedMaxDays >= minDays
        ? requestedMaxDays
        : null;

    return this.returnDueReader.findDueForReturn({
      minDays,
      maxDays,
      branchId: query.branchId,
      pagination: resolvePagination(query),
    });
  }
}
