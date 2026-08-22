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

export interface UpdateFollowUpData {
  deviceId?: string;
  plannedDate?: Date;
  plannedTime?: string;
  status?: FollowUpStatus;
  zoneIds?: string[];
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

export interface PendingSlotConflictQuery {
  deviceId: string;
  plannedDate: Date;
  plannedTime: string;
  excludeFollowUpId?: string;
}

export interface BookedSlotQuery {
  deviceId: string;
  plannedDate: Date;
}

export interface IFollowUpRepository {
  findAll(options: FollowUpListOptions): Promise<PaginatedResult<FollowUp>>;
  findById(id: string): Promise<FollowUp | null>;
  findUpcoming(
    options: UpcomingFollowUpListOptions,
  ): Promise<PaginatedResult<FollowUp>>;
  findByStatus(status: FollowUpStatus): Promise<FollowUp[]>;
  findPendingSlotConflict(
    query: PendingSlotConflictQuery,
  ): Promise<FollowUp | null>;
  findBookedTimesForDay(query: BookedSlotQuery): Promise<string[]>;
  create(data: CreateFollowUpData): Promise<FollowUp>;
  update(id: string, data: UpdateFollowUpData): Promise<FollowUp>;
  delete(id: string): Promise<void>;
}
