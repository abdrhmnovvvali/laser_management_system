import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import type { PaginatedResult } from '../pagination/pagination.types';
import { totalPages } from '../pagination/pagination.util';

export class PaginatedMetaDto {
  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 8 })
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginatedMetaDto;
}

export function createPaginatedResponseDto<T>(
  result: PaginatedResult<unknown>,
  data: T[],
): PaginatedResponseDto<T> {
  return {
    data,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: totalPages(result.total, result.limit),
    },
  };
}

export function createPaginatedResponseDtoClass<T>(
  itemClass: Type<T>,
  className: string,
): Type<PaginatedResponseDto<T>> {
  class PaginatedResponseHost implements PaginatedResponseDto<T> {
    @ApiProperty({ type: [itemClass] })
    data: T[];

    @ApiProperty({ type: PaginatedMetaDto })
    meta: PaginatedMetaDto;
  }

  Object.defineProperty(PaginatedResponseHost, 'name', { value: className });
  return PaginatedResponseHost;
}
