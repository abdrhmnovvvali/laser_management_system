import { FollowUp } from '../../domain/entities/follow-up.entity';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';

export interface FollowUpRow {
  id: string;
  customer_id: string;
  device_id: string;
  planned_date: string;
  planned_time: string;
  status: FollowUpStatus;
  created_at: string;
  follow_up_zones?: { zone_id: string }[] | null;
}

export class FollowUpPersistenceMapper {
  static toDomain(row: FollowUpRow): FollowUp {
    return new FollowUp(
      row.id,
      new Date(row.created_at),
      row.customer_id,
      row.device_id,
      new Date(row.planned_date),
      row.planned_time,
      row.status,
      (row.follow_up_zones ?? []).map((link) => link.zone_id),
    );
  }
}
