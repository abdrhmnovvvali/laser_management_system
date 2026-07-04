import { InternalServerErrorException } from '@nestjs/common';

export interface SupabasePostgrestError {
  message: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabasePostgrestError | null;
}

/**
 * Casts a raw (loosely-typed) Supabase query result into a known shape and
 * throws a consistent 500 if the query itself failed. Keeps repository
 * implementations free of repetitive error-handling and `any`-typed
 * destructuring (which `@typescript-eslint/no-unsafe-assignment` rejects).
 */
export function unwrap<T>(response: unknown): T | null {
  const { data, error } = response as SupabaseResponse<T>;
  if (error) {
    throw new InternalServerErrorException(error.message);
  }
  return data;
}

/**
 * Same as `unwrap`, but also throws when no row was found — use for
 * insert/update/single-row-expected queries.
 */
export function unwrapOrThrow<T>(response: unknown): T {
  const data = unwrap<T>(response);
  if (data === null || data === undefined) {
    throw new InternalServerErrorException('Gözlənilməz boş nəticə');
  }
  return data;
}
