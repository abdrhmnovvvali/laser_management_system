import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { FollowUpStatus } from './follow-up-status.enum';

export class FollowUp extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly customerId: string,
    public readonly deviceId: string,
    public readonly plannedDate: Date,
    public readonly plannedTime: string,
    public readonly status: FollowUpStatus,
    public readonly zoneIds: string[] = [],
  ) {
    super(id, createdAt);
  }
}
