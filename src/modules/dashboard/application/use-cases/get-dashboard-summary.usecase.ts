import { Injectable } from '@nestjs/common';
import { BirthdayFacade } from '../../../birthdays/application/birthday.facade';
import { CampaignFacade } from '../../../campaigns/application/campaign.facade';
import { CustomerFacade } from '../../../customers/application/customer.facade';
import { FollowUpFacade } from '../../../follow-ups/application/follow-up.facade';
import { FraudReportFacade } from '../../../fraud-detection/application/fraud-report.facade';
import { ProcedureFacade } from '../../../procedures/application/procedure.facade';
import { DashboardSummary } from '../../domain/entities/dashboard-summary.entity';

const UPCOMING_FOLLOW_UP_WINDOW_DAYS = 7;

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    private readonly customerFacade: CustomerFacade,
    private readonly procedureFacade: ProcedureFacade,
    private readonly birthdayFacade: BirthdayFacade,
    private readonly followUpFacade: FollowUpFacade,
    private readonly campaignFacade: CampaignFacade,
    private readonly fraudReportFacade: FraudReportFacade,
  ) {}

  async execute(branchId?: string): Promise<DashboardSummary> {
    const { monthStart, monthEnd } = this.currentMonthRange();

    const [
      totalCustomers,
      monthlyProcedures,
      todaysBirthdays,
      upcomingFollowUps,
      activeCampaigns,
      fraudAlerts,
    ] = await Promise.all([
      this.customerFacade.count({ branchId }),
      this.procedureFacade.list({
        branchId,
        dateFrom: monthStart,
        dateTo: monthEnd,
      }),
      this.birthdayFacade.listToday(),
      this.followUpFacade.listUpcoming(UPCOMING_FOLLOW_UP_WINDOW_DAYS),
      this.campaignFacade.listActive(),
      this.fraudReportFacade.getReport({ branchId }),
    ]);

    const monthlyRevenue = monthlyProcedures.reduce(
      (sum, procedure) => sum + procedure.price,
      0,
    );

    return new DashboardSummary(
      totalCustomers,
      monthlyRevenue,
      todaysBirthdays.length,
      upcomingFollowUps.length,
      activeCampaigns.length,
      fraudAlerts.length,
    );
  }

  private currentMonthRange(): { monthStart: Date; monthEnd: Date } {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    return { monthStart, monthEnd };
  }
}
