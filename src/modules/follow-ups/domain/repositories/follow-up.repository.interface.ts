import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { FollowUp } from '../entities/follow-up.entity';
import { FollowUpStatus } from '../entities/follow-up-status.enum';

export const FOLLOW_UP_REPOSITORY = Symbol('IFollowUpRepository');

export interface CreateFollowUpData {
  customerId: string;
  deviceId: string;
  plannedDate: Date;
  plannedTime: string;
  status?: FollowUpStatus;
  zoneIds: string[];
}

/** Repository-yə yazılan data — müddət use-case tərəfindən hesablanır. */
export interface CreateFollowUpRecord extends CreateFollowUpData {
  durationMinMinutes: number;
  durationMaxMinutes: number;
}

export interface UpdateFollowUpData {
  deviceId?: string;
  plannedDate?: Date;
  plannedTime?: string;
  status?: FollowUpStatus;
  zoneIds?: string[];
}

export interface UpdateFollowUpRecord extends UpdateFollowUpData {
  durationMinMinutes?: number;
  durationMaxMinutes?: number;
}

export interface FollowUpListOptions {
  customerId?: string;
  deviceId?: string;
  plannedDate?: Date;
  status?: FollowUpStatus;
  pagination?: PaginationParams;
}

export interface UpcomingFollowUpListOptions {
  days: number;
  pagination?: PaginationParams;
}

export interface PendingDayBookingsQuery {
  deviceId: string;
  plannedDate: Date;
  excludeFollowUpId?: string;
}

export interface IFollowUpRepository {
  findAll(options: FollowUpListOptions): Promise<PaginatedResult<FollowUp>>;
  findById(id: string): Promise<FollowUp | null>;
  findUpcoming(
    options: UpcomingFollowUpListOptions,
  ): Promise<PaginatedResult<FollowUp>>;
  findByStatus(status: FollowUpStatus): Promise<FollowUp[]>;
  /** Cihazın həmin gün üçün gözləmədə olan rezervasiyaları (saata görə sıralı). */
  findPendingForDay(query: PendingDayBookingsQuery): Promise<FollowUp[]>;
  create(data: CreateFollowUpRecord): Promise<FollowUp>;
  update(id: string, data: UpdateFollowUpRecord): Promise<FollowUp>;
  delete(id: string): Promise<void>;
}
