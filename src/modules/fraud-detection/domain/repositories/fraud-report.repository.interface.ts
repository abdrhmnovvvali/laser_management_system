import { FraudReportItem } from '../entities/fraud-report-item.entity';

export const FRAUD_REPORT_REPOSITORY = Symbol('IFraudReportRepository');

export interface FraudReportFilters {
  deviceId?: string;
  branchId?: string;
}

export interface IFraudReportRepository {
  findMismatches(filters: FraudReportFilters): Promise<FraudReportItem[]>;
}
