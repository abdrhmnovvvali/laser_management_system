import { unwrap } from './supabase-response.util';

export function readPaginatedRows<TRow>(response: unknown): {
  rows: TRow[];
  total: number;
} {
  const rows = unwrap<TRow[]>(response) ?? [];
  const total = (response as { count?: number | null }).count ?? rows.length;
  return { rows, total };
}
