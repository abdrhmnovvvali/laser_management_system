import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from './pagination.constants';
import type { PaginatedResult, PaginationParams } from './pagination.types';

export type { PaginatedResult, PaginationParams };

export function resolvePagination(query: {
  page?: number;
  limit?: number;
}): PaginationParams {
  const page = Math.max(1, query.page ?? DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, query.limit ?? DEFAULT_LIMIT),
  );
  return { page, limit };
}

export function toOffset(pagination: PaginationParams): {
  from: number;
  to: number;
} {
  const from = (pagination.page - 1) * pagination.limit;
  return { from, to: from + pagination.limit - 1 };
}

export function createPaginatedResult<T>(
  items: T[],
  total: number,
  pagination?: PaginationParams,
): PaginatedResult<T> {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? (total > 0 ? total : DEFAULT_LIMIT);
  return { items, total, page, limit };
}

export function totalPages(total: number, limit: number): number {
  if (limit <= 0) {
    return 0;
  }
  return Math.ceil(total / limit);
}
