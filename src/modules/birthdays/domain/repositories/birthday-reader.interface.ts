import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { BirthdayCustomer } from '../entities/birthday-customer.entity';

/** RLS-aware reader used by the manual-check HTTP endpoint. */
export const BIRTHDAY_READER = Symbol('IBirthdayReader');

/** Admin (RLS-bypassing) reader used by the daily cron. */
export const BIRTHDAY_ADMIN_READER = Symbol('IBirthdayAdminReader');

export interface BirthdayListOptions {
  pagination?: PaginationParams;
}

export interface IBirthdayReader {
  findTodaysBirthdays(
    options?: BirthdayListOptions,
  ): Promise<PaginatedResult<BirthdayCustomer>>;
}
