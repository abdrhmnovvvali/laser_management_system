import { Module } from '@nestjs/common';
import { BranchesModule } from '../../branches/presentation/branches.module';
import { FRAUD_REPORT_REPOSITORY } from '../domain/repositories/fraud-report.repository.interface';
import { PrismaFraudReportRepository } from '../infrastructure/persistence/prisma/prisma-fraud-report.repository';
import { ProcedureCompletedListener } from '../application/listeners/procedure-completed.listener';
import { FraudReportFacade } from '../application/fraud-report.facade';
import { GetFraudReportUseCase } from '../application/use-cases/get-fraud-report.usecase';
import { FraudReportController } from './controllers/fraud-report.controller';

@Module({
  imports: [BranchesModule],
  controllers: [FraudReportController],
  providers: [
    GetFraudReportUseCase,
    ProcedureCompletedListener,
    FraudReportFacade,
    {
      provide: FRAUD_REPORT_REPOSITORY,
      useClass: PrismaFraudReportRepository,
    },
  ],
  exports: [FraudReportFacade],
})
export class FraudDetectionModule {}
