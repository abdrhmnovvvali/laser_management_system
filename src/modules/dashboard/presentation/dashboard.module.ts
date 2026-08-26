import { Module } from '@nestjs/common';
import { BirthdaysModule } from '../../birthdays/presentation/birthdays.module';
import { BranchesModule } from '../../branches/presentation/branches.module';
import { CampaignsModule } from '../../campaigns/presentation/campaigns.module';
import { CustomersModule } from '../../customers/presentation/customers.module';
import { DevicesModule } from '../../devices/presentation/devices.module';
import { FollowUpsModule } from '../../follow-ups/presentation/follow-ups.module';
import { FraudDetectionModule } from '../../fraud-detection/presentation/fraud-detection.module';
import { NotificationsModule } from '../../notifications/presentation/notifications.module';
import { PackagesModule } from '../../packages/presentation/packages.module';
import { ProceduresModule } from '../../procedures/presentation/procedures.module';
import { ZonesModule } from '../../zones/presentation/zones.module';
import { GetDashboardSummaryUseCase } from '../application/use-cases/get-dashboard-summary.usecase';
import { DashboardController } from './controllers/dashboard.controller';

@Module({
  imports: [
    CustomersModule,
    ProceduresModule,
    BirthdaysModule,
    FollowUpsModule,
    CampaignsModule,
    PackagesModule,
    ZonesModule,
    FraudDetectionModule,
    BranchesModule,
    DevicesModule,
    NotificationsModule,
  ],
  controllers: [DashboardController],
  providers: [GetDashboardSummaryUseCase],
})
export class DashboardModule {}
