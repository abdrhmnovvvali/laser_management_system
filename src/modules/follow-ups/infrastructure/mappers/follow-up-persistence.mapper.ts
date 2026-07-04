import { FollowUp } from '../../domain/entities/follow-up.entity';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';

export interface FollowUpRow {
  id: string;
  customer_id: string;
  planned_date: string;
  status: FollowUpStatus;
  created_at: string;
}

export class FollowUpPersistenceMapper {
  static toDomain(row: FollowUpRow): FollowUp {
    return new FollowUp(
      row.id,
      new Date(row.created_at),
      row.customer_id,
      new Date(row.planned_date),
      row.status,
    );
  }
}
