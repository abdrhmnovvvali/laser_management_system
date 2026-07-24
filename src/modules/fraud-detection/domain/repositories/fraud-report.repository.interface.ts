import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { FraudReportItem } from '../entities/fraud-report-item.entity';

export const FRAUD_REPORT_REPOSITORY = Symbol('IFraudReportRepository');

export interface FraudReportFilters {
  deviceId?: string;
  branchId?: string;
  pagination?: PaginationParams;
}

export interface IFraudReportRepository {
  findMismatches(
    filters: FraudReportFilters,
  ): Promise<PaginatedResult<FraudReportItem>>;
}
