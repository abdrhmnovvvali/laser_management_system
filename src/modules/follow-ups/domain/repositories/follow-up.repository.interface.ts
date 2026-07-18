import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { FollowUp } from '../entities/follow-up.entity';
import { FollowUpStatus } from '../entities/follow-up-status.enum';

export const FOLLOW_UP_REPOSITORY = Symbol('IFollowUpRepository');

export interface CreateFollowUpData {
  customerId: string;
  plannedDate: Date;
  status?: FollowUpStatus;
  zoneId?: string;
}

export interface UpdateFollowUpData {
  plannedDate?: Date;
  status?: FollowUpStatus;
  zoneId?: string | null;
}

export interface FollowUpListOptions {
  customerId: string;
  pagination?: PaginationParams;
}

export interface UpcomingFollowUpListOptions {
  days: number;
  pagination?: PaginationParams;
}

export interface IFollowUpRepository {
  findAllByCustomer(
    options: FollowUpListOptions,
  ): Promise<PaginatedResult<FollowUp>>;
  findById(id: string): Promise<FollowUp | null>;
<<<<<<< HEAD
  findUpcoming(
    options: UpcomingFollowUpListOptions,
  ): Promise<PaginatedResult<FollowUp>>;
=======
  findUpcoming(days: number): Promise<FollowUp[]>;
  findByStatus(status: FollowUpStatus): Promise<FollowUp[]>;
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
  create(data: CreateFollowUpData): Promise<FollowUp>;
  update(id: string, data: UpdateFollowUpData): Promise<FollowUp>;
  delete(id: string): Promise<void>;
}
