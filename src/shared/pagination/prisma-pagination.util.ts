import type { PaginationParams } from './pagination.types';

export function toPrismaSkipTake(pagination?: PaginationParams): {
  skip?: number;
  take?: number;
} {
  if (!pagination) {
    return {};
  }
  return {
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
  };
}
