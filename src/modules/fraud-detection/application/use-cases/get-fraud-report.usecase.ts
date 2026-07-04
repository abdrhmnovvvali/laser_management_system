import { Inject, Injectable } from '@nestjs/common';
import { FraudReportItem } from '../../domain/entities/fraud-report-item.entity';
import { FRAUD_REPORT_REPOSITORY } from '../../domain/repositories/fraud-report.repository.interface';
import type {
  FraudReportFilters,
  IFraudReportRepository,
} from '../../domain/repositories/fraud-report.repository.interface';

@Injectable()
export class GetFraudReportUseCase {
  constructor(
    @Inject(FRAUD_REPORT_REPOSITORY)
    private readonly fraudReportRepository: IFraudReportRepository,
  ) {}

  async execute(filters: FraudReportFilters): Promise<FraudReportItem[]> {
    return this.fraudReportRepository.findMismatches(filters);
  }
}
