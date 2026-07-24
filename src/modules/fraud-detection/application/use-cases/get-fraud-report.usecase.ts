import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { FRAUD_REPORT_REPOSITORY } from '../../domain/repositories/fraud-report.repository.interface';
import type {
  FraudReportFilters,
  IFraudReportRepository,
} from '../../domain/repositories/fraud-report.repository.interface';
import { FraudReportQueryDto } from '../dto/fraud-report-query.dto';

@Injectable()
export class GetFraudReportUseCase {
  constructor(
    @Inject(FRAUD_REPORT_REPOSITORY)
    private readonly fraudReportRepository: IFraudReportRepository,
  ) {}

  async execute(
    query: FraudReportQueryDto,
    options?: { skipPagination?: boolean },
  ) {
    const filters: FraudReportFilters = {
      deviceId: query.deviceId,
      branchId: query.branchId,
      pagination: options?.skipPagination
        ? undefined
        : resolvePagination(query),
    };
    return this.fraudReportRepository.findMismatches(filters);
  }
}
