import { FollowUp } from '../entities/follow-up.entity';

export const FOLLOW_UP_ADMIN_READER = Symbol('IFollowUpAdminReader');

/**
 * Read port backed by the service-role (RLS-bypassing) client. Used only by
 * background jobs (cron) that run outside any HTTP request context, where a
 * request-scoped, RLS-aware client is unavailable.
 */
export interface IFollowUpAdminReader {
  findDueOn(date: Date): Promise<FollowUp[]>;
}
