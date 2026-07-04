import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { FollowUpStatus } from './follow-up-status.enum';

export class FollowUp extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly customerId: string,
    public readonly plannedDate: Date,
    public readonly status: FollowUpStatus,
  ) {
    super(id, createdAt);
  }
}
