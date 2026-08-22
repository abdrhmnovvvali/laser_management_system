const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

/** Parse YYYY-MM-DD (or ISO datetime prefix) as a UTC calendar date. */
export function parseDateOnlyString(value: string): Date {
  const match = DATE_ONLY_PATTERN.exec(value.trim());

  if (!match) {
    throw new Error(`Invalid date-only string: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(Date.UTC(year, month - 1, day));
}

/** Normalize a Date to UTC midnight for its UTC calendar day. */
export function toDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** Format a Date as YYYY-MM-DD using UTC calendar components. */
export function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) {
    return toDateOnly(value);
  }

  return parseDateOnlyString(value);
}

/** Local calendar "today" stored with the same UTC date-only convention. */
export function getLocalTodayDateOnly(): Date {
  const now = new Date();

  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
}

export function isSameDateOnly(left: Date, right: Date): boolean {
  return formatDateOnly(left) === formatDateOnly(right);
}
