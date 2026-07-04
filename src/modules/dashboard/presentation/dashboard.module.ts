import { Module } from '@nestjs/common';
import { BirthdaysModule } from '../../birthdays/presentation/birthdays.module';
import { CampaignsModule } from '../../campaigns/presentation/campaigns.module';
import { CustomersModule } from '../../customers/presentation/customers.module';
import { FollowUpsModule } from '../../follow-ups/presentation/follow-ups.module';
import { FraudDetectionModule } from '../../fraud-detection/presentation/fraud-detection.module';
import { ProceduresModule } from '../../procedures/presentation/procedures.module';
import { GetDashboardSummaryUseCase } from '../application/use-cases/get-dashboard-summary.usecase';
import { DashboardController } from './controllers/dashboard.controller';

@Module({
  imports: [
    CustomersModule,
    ProceduresModule,
    BirthdaysModule,
    FollowUpsModule,
    CampaignsModule,
    FraudDetectionModule,
  ],
  controllers: [DashboardController],
  providers: [GetDashboardSummaryUseCase],
})
export class DashboardModule {}
