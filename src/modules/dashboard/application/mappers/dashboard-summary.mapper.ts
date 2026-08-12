import { DashboardSummary } from '../../domain/entities/dashboard-summary.entity';
import {
  DashboardAlertsDto,
  DashboardBranchStatsDto,
  DashboardFraudAlertDto,
  DashboardOperationsDto,
  DashboardOverviewDto,
  DashboardPeriodDto,
  DashboardProblemDto,
  DashboardSummaryResponseDto,
  DashboardUnreadNotificationsDto,
} from '../dto/dashboard-summary-response.dto';

export class DashboardSummaryMapper {
  static toResponseDto(summary: DashboardSummary): DashboardSummaryResponseDto {
    const dto = new DashboardSummaryResponseDto();

    dto.period = this.mapPeriod(summary);
    dto.overview = this.mapOverview(summary);
    dto.operations = this.mapOperations(summary);
    dto.alerts = this.mapAlerts(summary);
    dto.branches = summary.branches.map((branch) => this.mapBranch(branch));
    dto.problems = summary.problems.map((problem) => this.mapProblem(problem));

    return dto;
  }

  private static mapPeriod(summary: DashboardSummary): DashboardPeriodDto {
    const period = new DashboardPeriodDto();
    period.monthStart = summary.period.monthStart;
    period.monthEnd = summary.period.monthEnd;
    period.generatedAt = summary.period.generatedAt;
    return period;
  }

  private static mapOverview(summary: DashboardSummary): DashboardOverviewDto {
    const overview = new DashboardOverviewDto();
    overview.totalCustomers = summary.overview.totalCustomers;
    overview.newCustomersThisMonth = summary.overview.newCustomersThisMonth;
    overview.proceduresThisMonth = summary.overview.proceduresThisMonth;
    overview.proceduresToday = summary.overview.proceduresToday;
    overview.monthlyRevenue = summary.overview.monthlyRevenue;
    overview.todayRevenue = summary.overview.todayRevenue;
    overview.averageProcedureValueThisMonth =
      summary.overview.averageProcedureValueThisMonth;
    overview.totalDiscountThisMonth = summary.overview.totalDiscountThisMonth;
    overview.loyaltyRewardsThisMonth = summary.overview.loyaltyRewardsThisMonth;
    return overview;
  }

  private static mapOperations(summary: DashboardSummary): DashboardOperationsDto {
    const operations = new DashboardOperationsDto();
    operations.totalBranches = summary.operations.totalBranches;
    operations.totalDevices = summary.operations.totalDevices;
    operations.activeCampaigns = summary.operations.activeCampaigns;
    operations.todaysBirthdays = summary.operations.todaysBirthdays;
    operations.followUpsDueToday = summary.operations.followUpsDueToday;
    operations.followUpsUpcoming = summary.operations.followUpsUpcoming;
    operations.followUpsOverdue = summary.operations.followUpsOverdue;
    operations.followUpsMissed = summary.operations.followUpsMissed;
    return operations;
  }

  private static mapAlerts(summary: DashboardSummary): DashboardAlertsDto {
    const unread = new DashboardUnreadNotificationsDto();
    unread.total = summary.alerts.unreadNotifications.total;
    unread.fraud = summary.alerts.unreadNotifications.fraud;
    unread.followUp = summary.alerts.unreadNotifications.followUp;
    unread.birthday = summary.alerts.unreadNotifications.birthday;

    const alerts = new DashboardAlertsDto();
    alerts.fraudCases = summary.alerts.fraudCases;
    alerts.unreadNotifications = unread;
    alerts.topFraudCases = summary.alerts.topFraudCases.map((item) =>
      this.mapFraudAlert(item),
    );
    return alerts;
  }

  private static mapFraudAlert(
    item: DashboardSummary['alerts']['topFraudCases'][number],
  ): DashboardFraudAlertDto {
    const alert = new DashboardFraudAlertDto();
    alert.procedureId = item.procedureId;
    alert.customerId = item.customerId;
    alert.branchId = item.branchId;
    alert.branchName = item.branchName;
    alert.declaredShotCount = item.declaredShotCount;
    alert.actualShotCount = item.actualShotCount;
    alert.difference = item.difference;
    alert.date = item.date;
    return alert;
  }

  private static mapBranch(
    branch: DashboardSummary['branches'][number],
  ): DashboardBranchStatsDto {
    const dto = new DashboardBranchStatsDto();
    dto.branchId = branch.branchId;
    dto.branchName = branch.branchName;
    dto.customers = branch.customers;
    dto.proceduresThisMonth = branch.proceduresThisMonth;
    dto.monthlyRevenue = branch.monthlyRevenue;
    dto.fraudCases = branch.fraudCases;
    dto.unreadNotifications = branch.unreadNotifications;
    return dto;
  }

  private static mapProblem(
    problem: DashboardSummary['problems'][number],
  ): DashboardProblemDto {
    const dto = new DashboardProblemDto();
    dto.severity = problem.severity;
    dto.type = problem.type;
    dto.message = problem.message;
    dto.count = problem.count;
    dto.branchId = problem.branchId;
    dto.branchName = problem.branchName;
    dto.threshold = problem.threshold;
    return dto;
  }
}
