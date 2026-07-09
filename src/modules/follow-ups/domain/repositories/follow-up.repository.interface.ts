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

export interface IFollowUpRepository {
  findAllByCustomer(customerId: string): Promise<FollowUp[]>;
  findById(id: string): Promise<FollowUp | null>;
  findUpcoming(days: number): Promise<FollowUp[]>;
  create(data: CreateFollowUpData): Promise<FollowUp>;
  update(id: string, data: UpdateFollowUpData): Promise<FollowUp>;
  delete(id: string): Promise<void>;
}
