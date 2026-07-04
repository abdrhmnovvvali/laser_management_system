import { Injectable } from '@nestjs/common';
import { FraudReportItem } from '../domain/entities/fraud-report-item.entity';
import type { FraudReportFilters } from '../domain/repositories/fraud-report.repository.interface';
import { GetFraudReportUseCase } from './use-cases/get-fraud-report.usecase';

/**
 * Public surface for other modules (Dashboard) needing read access to
 * fraud report data without depending on FraudDetectionModule's internals.
 */
@Injectable()
export class FraudReportFacade {
  constructor(private readonly getFraudReportUseCase: GetFraudReportUseCase) {}

  async getReport(filters: FraudReportFilters): Promise<FraudReportItem[]> {
    return this.getFraudReportUseCase.execute(filters);
  }
}
