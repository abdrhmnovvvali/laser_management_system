import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { FollowUp } from '../entities/follow-up.entity';
import { FollowUpStatus } from '../entities/follow-up-status.enum';

export const FOLLOW_UP_REPOSITORY = Symbol('IFollowUpRepository');

export interface CreateFollowUpData {
  customerId: string;
  plannedDate: Date;
  status?: FollowUpStatus;
  zoneIds?: string[];
}

export interface UpdateFollowUpData {
  plannedDate?: Date;
  status?: FollowUpStatus;
  zoneIds?: string[];
}

export interface FollowUpListOptions {
  customerId?: string;
  status?: FollowUpStatus;
  pagination?: PaginationParams;
}

export interface UpcomingFollowUpListOptions {
  days: number;
  pagination?: PaginationParams;
}

export interface IFollowUpRepository {
  findAll(options: FollowUpListOptions): Promise<PaginatedResult<FollowUp>>;
  findById(id: string): Promise<FollowUp | null>;
  findUpcoming(
    options: UpcomingFollowUpListOptions,
  ): Promise<PaginatedResult<FollowUp>>;
  findByStatus(status: FollowUpStatus): Promise<FollowUp[]>;
  create(data: CreateFollowUpData): Promise<FollowUp>;
  update(id: string, data: UpdateFollowUpData): Promise<FollowUp>;
  delete(id: string): Promise<void>;
}
