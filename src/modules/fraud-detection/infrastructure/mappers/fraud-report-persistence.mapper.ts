import { FraudReportItem } from '../../domain/entities/fraud-report-item.entity';

export interface FraudReportRow {
  id: string;
  device_id: string;
  declared_shot_count: number;
  actual_shot_count: number;
  date: string;
  customer_id: string;
  branch_id: string;
}

export class FraudReportPersistenceMapper {
  static toDomain(row: FraudReportRow): FraudReportItem {
    return new FraudReportItem(
      row.id,
      row.customer_id,
      row.device_id,
      row.branch_id,
      row.declared_shot_count,
      row.actual_shot_count,
      new Date(row.date),
    );
  }
}
