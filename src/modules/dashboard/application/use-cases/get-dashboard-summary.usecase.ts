import { Injectable } from '@nestjs/common';
import { BirthdayFacade } from '../../../birthdays/application/birthday.facade';
import { BranchFacade } from '../../../branches/application/branch.facade';
import { CampaignFacade } from '../../../campaigns/application/campaign.facade';
import { Customer } from '../../../customers/domain/entities/customer.entity';
import { CustomerFacade } from '../../../customers/application/customer.facade';
import { DeviceFacade } from '../../../devices/application/device.facade';
import { FollowUp } from '../../../follow-ups/domain/entities/follow-up.entity';
import { FollowUpStatus } from '../../../follow-ups/domain/entities/follow-up-status.enum';
import { FollowUpFacade } from '../../../follow-ups/application/follow-up.facade';
import { FraudReportFacade } from '../../../fraud-detection/application/fraud-report.facade';
import { FraudReportItem } from '../../../fraud-detection/domain/entities/fraud-report-item.entity';
import { NotificationType } from '../../../notifications/domain/entities/notification-type.enum';
import { NotificationFacade } from '../../../notifications/application/notification.facade';
import { Procedure } from '../../../procedures/domain/entities/procedure.entity';
import { ProcedureFacade } from '../../../procedures/application/procedure.facade';
import {
  DashboardAlerts,
  DashboardBranchStats,
  DashboardOperations,
  DashboardOverview,
  DashboardPeriod,
  DashboardProblem,
  DashboardProblemSeverity,
  DashboardSummary,
} from '../../domain/entities/dashboard-summary.entity';

const UPCOMING_FOLLOW_UP_WINDOW_DAYS = 7;
const CRITICAL_FRAUD_DIFFERENCE = 500;
const WARNING_FRAUD_DIFFERENCE = 100;
const TOP_FRAUD_CASES_LIMIT = 5;
const TIME_ZONE = 'Asia/Baku';

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    private readonly customerFacade: CustomerFacade,
    private readonly procedureFacade: ProcedureFacade,
    private readonly birthdayFacade: BirthdayFacade,
    private readonly followUpFacade: FollowUpFacade,
    private readonly campaignFacade: CampaignFacade,
    private readonly fraudReportFacade: FraudReportFacade,
    private readonly branchFacade: BranchFacade,
    private readonly deviceFacade: DeviceFacade,
    private readonly notificationFacade: NotificationFacade,
  ) {}

  async execute(branchId?: string): Promise<DashboardSummary> {
    const generatedAt = new Date();
    const { monthStart, monthEnd } = this.currentMonthRange(generatedAt);
    const todayKey = this.toDateKey(generatedAt);

    const [
      customers,
      monthlyProcedures,
      todayProcedures,
      todaysBirthdays,
      upcomingFollowUps,
      pendingFollowUps,
      missedFollowUps,
      activeCampaigns,
      fraudAlerts,
      branches,
      devices,
      unreadNotifications,
    ] = await Promise.all([
      this.customerFacade.list(branchId ? { branchId } : {}),
      this.procedureFacade.list({
        branchId,
        dateFrom: monthStart,
        dateTo: monthEnd,
      }),
      this.procedureFacade.list({ branchId }),
      this.birthdayFacade.listToday(),
      this.followUpFacade.listUpcoming(UPCOMING_FOLLOW_UP_WINDOW_DAYS),
      this.followUpFacade.listByStatus(FollowUpStatus.PENDING),
      this.followUpFacade.listByStatus(FollowUpStatus.MISSED),
      this.campaignFacade.listActive(),
      this.fraudReportFacade.getReport({ branchId }),
      this.branchFacade.listAll(),
      this.deviceFacade.listAll(branchId),
      this.notificationFacade.list({ isRead: false }),
    ]);

    const customerBranchMap = new Map(
      customers.map((customer) => [customer.id, customer.branchId]),
    );
    const branchNameMap = new Map(branches.map((branch) => [branch.id, branch.name]));

    const scopedTodaysBirthdays = this.filterByBranch(
      todaysBirthdays,
      branchId,
      (item) => item.branchId,
    );
    const scopedPendingFollowUps = this.filterFollowUpsByBranch(
      pendingFollowUps,
      customers,
      branchId,
    );
    const scopedMissedFollowUps = this.filterFollowUpsByBranch(
      missedFollowUps,
      customers,
      branchId,
    );
    const scopedUpcomingFollowUps = this.filterFollowUpsByBranch(
      upcomingFollowUps,
      customers,
      branchId,
    );
    const scopedUnreadNotifications = this.filterNotificationsByBranch(
      unreadNotifications,
      customerBranchMap,
      branchId,
    );
    const proceduresToday = todayProcedures.filter((procedure) =>
      this.isSameDay(procedure.date, generatedAt),
    );

    const followUpsDueToday = scopedPendingFollowUps.filter((followUp) =>
      this.isSameDay(followUp.plannedDate, generatedAt),
    );
    const followUpsOverdue = scopedPendingFollowUps.filter(
      (followUp) =>
        this.toDateKey(followUp.plannedDate) < todayKey &&
        !this.isSameDay(followUp.plannedDate, generatedAt),
    );
    const followUpsUpcoming = scopedUpcomingFollowUps.filter(
      (followUp) => !this.isSameDay(followUp.plannedDate, generatedAt),
    );

    const newCustomersThisMonth = customers.filter(
      (customer) => customer.registeredAt >= monthStart,
    ).length;
    const monthlyRevenue = this.sumRevenue(monthlyProcedures);
    const todayRevenue = this.sumRevenue(proceduresToday);
    const totalDiscountThisMonth = monthlyProcedures.reduce(
      (sum, procedure) => sum + procedure.discountAmount,
      0,
    );
    const loyaltyRewardsThisMonth = monthlyProcedures.filter(
      (procedure) => procedure.loyaltyRewardApplied,
    ).length;

    const overview: DashboardOverview = {
      totalCustomers: customers.length,
      newCustomersThisMonth,
      proceduresThisMonth: monthlyProcedures.length,
      proceduresToday: proceduresToday.length,
      monthlyRevenue,
      todayRevenue,
      averageProcedureValueThisMonth:
        monthlyProcedures.length > 0
          ? Number((monthlyRevenue / monthlyProcedures.length).toFixed(2))
          : 0,
      totalDiscountThisMonth,
      loyaltyRewardsThisMonth,
    };

    const operations: DashboardOperations = {
      totalBranches: branchId ? 1 : branches.length,
      totalDevices: devices.length,
      activeCampaigns: activeCampaigns.length,
      todaysBirthdays: scopedTodaysBirthdays.length,
      followUpsDueToday: followUpsDueToday.length,
      followUpsUpcoming: followUpsUpcoming.length,
      followUpsOverdue: followUpsOverdue.length,
      followUpsMissed: scopedMissedFollowUps.length,
    };

    const unreadByType = this.countUnreadByType(scopedUnreadNotifications);
    const topFraudCases = [...fraudAlerts]
      .sort(
        (left, right) =>
          Math.abs(right.difference) - Math.abs(left.difference),
      )
      .slice(0, TOP_FRAUD_CASES_LIMIT)
      .map((item) => ({
        procedureId: item.procedureId,
        customerId: item.customerId,
        branchId: item.branchId,
        branchName: branchNameMap.get(item.branchId) ?? null,
        declaredShotCount: item.declaredShotCount,
        actualShotCount: item.actualShotCount,
        difference: item.difference,
        date: item.date,
      }));

    const alerts: DashboardAlerts = {
      fraudCases: fraudAlerts.length,
      unreadNotifications: unreadByType,
      topFraudCases,
    };

    const visibleBranches = branchId
      ? branches.filter((branch) => branch.id === branchId)
      : branches;

    const branchStats = this.buildBranchStats(
      visibleBranches,
      customers,
      monthlyProcedures,
      fraudAlerts,
      scopedUnreadNotifications,
      customerBranchMap,
    );

    const problems = this.buildProblems({
      fraudAlerts,
      branchNameMap,
      followUpsOverdue,
      followUpsMissed: scopedMissedFollowUps,
      unreadByType,
      todaysBirthdaysCount: scopedTodaysBirthdays.length,
      followUpsDueTodayCount: followUpsDueToday.length,
      followUpsUpcomingCount: followUpsUpcoming.length,
      activeCampaignsCount: activeCampaigns.length,
    });

    const period: DashboardPeriod = {
      monthStart,
      monthEnd,
      generatedAt,
    };

    return new DashboardSummary(
      period,
      overview,
      operations,
      alerts,
      branchStats,
      problems,
    );
  }

  private buildBranchStats(
    branches: Array<{ id: string; name: string }>,
    customers: Customer[],
    monthlyProcedures: Procedure[],
    fraudAlerts: FraudReportItem[],
    unreadNotifications: Array<{ customerId: string | null }>,
    customerBranchMap: Map<string, string>,
  ): DashboardBranchStats[] {
    return branches.map((branch) => {
      const branchCustomers = customers.filter(
        (customer) => customer.branchId === branch.id,
      );
      const branchCustomerIds = new Set(branchCustomers.map((customer) => customer.id));
      const branchProcedures = monthlyProcedures.filter((procedure) =>
        branchCustomerIds.has(procedure.customerId),
      );
      const branchFraud = fraudAlerts.filter(
        (item) => item.branchId === branch.id,
      );
      const branchUnread = unreadNotifications.filter((notification) => {
        if (!notification.customerId) {
          return false;
        }
        return customerBranchMap.get(notification.customerId) === branch.id;
      });

      return {
        branchId: branch.id,
        branchName: branch.name,
        customers: branchCustomers.length,
        proceduresThisMonth: branchProcedures.length,
        monthlyRevenue: this.sumRevenue(branchProcedures),
        fraudCases: branchFraud.length,
        unreadNotifications: branchUnread.length,
      };
    });
  }

  private buildProblems(input: {
    fraudAlerts: FraudReportItem[];
    branchNameMap: Map<string, string>;
    followUpsOverdue: FollowUp[];
    followUpsMissed: FollowUp[];
    unreadByType: {
      total: number;
      fraud: number;
      followUp: number;
      birthday: number;
    };
    todaysBirthdaysCount: number;
    followUpsDueTodayCount: number;
    followUpsUpcomingCount: number;
    activeCampaignsCount: number;
  }): DashboardProblem[] {
    const problems: DashboardProblem[] = [];

    const criticalFraud = input.fraudAlerts.filter(
      (item) => Math.abs(item.difference) >= CRITICAL_FRAUD_DIFFERENCE,
    );
    const warningFraud = input.fraudAlerts.filter(
      (item) =>
        Math.abs(item.difference) >= WARNING_FRAUD_DIFFERENCE &&
        Math.abs(item.difference) < CRITICAL_FRAUD_DIFFERENCE,
    );

    if (criticalFraud.length > 0) {
      problems.push({
        severity: 'critical',
        type: 'fraud_critical',
        message: `${criticalFraud.length} prosedurda kritik atış sayı uyğunsuzluğu var (>= ${CRITICAL_FRAUD_DIFFERENCE})`,
        count: criticalFraud.length,
      });
    }

    if (warningFraud.length > 0) {
      problems.push({
        severity: 'warning',
        type: 'fraud_warning',
        message: `${warningFraud.length} prosedurda atış sayı uyğunsuzluğu var`,
        count: warningFraud.length,
      });
    }

    if (input.followUpsOverdue.length > 0) {
      problems.push({
        severity: 'critical',
        type: 'follow_up_overdue',
        message: `${input.followUpsOverdue.length} planlaşdırılmış vizit vaxtı keçib, hələ pending statusundadır`,
        count: input.followUpsOverdue.length,
      });
    }

    if (input.followUpsMissed.length > 0) {
      problems.push({
        severity: 'warning',
        type: 'follow_up_missed',
        message: `${input.followUpsMissed.length} vizit missed statusundadır`,
        count: input.followUpsMissed.length,
      });
    }

    if (input.unreadByType.fraud > 0) {
      problems.push({
        severity: 'warning',
        type: 'unread_fraud_notifications',
        message: `${input.unreadByType.fraud} oxunmamış fraud bildirişi var`,
        count: input.unreadByType.fraud,
      });
    }

    if (input.unreadByType.followUp > 0) {
      problems.push({
        severity: 'info',
        type: 'unread_follow_up_notifications',
        message: `${input.unreadByType.followUp} oxunmamış follow-up bildirişi var`,
        count: input.unreadByType.followUp,
      });
    }

    if (input.todaysBirthdaysCount > 0) {
      problems.push({
        severity: 'info',
        type: 'birthdays_today',
        message: `Bu gün ${input.todaysBirthdaysCount} müştərinin ad günüdür`,
        count: input.todaysBirthdaysCount,
      });
    }

    if (input.followUpsDueTodayCount > 0) {
      problems.push({
        severity: 'info',
        type: 'follow_ups_due_today',
        message: `Bu gün ${input.followUpsDueTodayCount} planlaşdırılmış vizit var`,
        count: input.followUpsDueTodayCount,
      });
    }

    if (input.followUpsUpcomingCount > 0) {
      problems.push({
        severity: 'info',
        type: 'follow_ups_upcoming',
        message: `Növbəti 7 gündə ${input.followUpsUpcomingCount} vizit planlaşdırılıb`,
        count: input.followUpsUpcomingCount,
      });
    }

    const fraudByBranch = this.groupCountByBranch(input.fraudAlerts);
    for (const [branchId, count] of fraudByBranch) {
      if (count > 0) {
        problems.push({
          severity: count >= 3 ? 'critical' : 'warning',
          type: 'branch_fraud',
          message: `${input.branchNameMap.get(branchId) ?? branchId} filialında ${count} fraud halı var`,
          count,
          branchId,
          branchName: input.branchNameMap.get(branchId),
        });
      }
    }

    return this.sortProblems(problems);
  }

  private groupCountByBranch(
    fraudAlerts: FraudReportItem[],
  ): Map<string, number> {
    const counts = new Map<string, number>();
    for (const alert of fraudAlerts) {
      counts.set(alert.branchId, (counts.get(alert.branchId) ?? 0) + 1);
    }
    return counts;
  }

  private sortProblems(problems: DashboardProblem[]): DashboardProblem[] {
    const order: Record<DashboardProblemSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
    };

    return [...problems].sort(
      (left, right) => order[left.severity] - order[right.severity],
    );
  }

  private countUnreadByType(
    notifications: Array<{ type: NotificationType }>,
  ): {
    total: number;
    fraud: number;
    followUp: number;
    birthday: number;
  } {
    return {
      total: notifications.length,
      fraud: notifications.filter(
        (notification) => notification.type === NotificationType.FRAUD,
      ).length,
      followUp: notifications.filter(
        (notification) => notification.type === NotificationType.FOLLOW_UP,
      ).length,
      birthday: notifications.filter(
        (notification) => notification.type === NotificationType.BIRTHDAY,
      ).length,
    };
  }

  private filterByBranch<T>(
    items: T[],
    branchId: string | undefined,
    getBranchId: (item: T) => string,
  ): T[] {
    if (!branchId) {
      return items;
    }
    return items.filter((item) => getBranchId(item) === branchId);
  }

  private filterFollowUpsByBranch(
    followUps: FollowUp[],
    customers: Customer[],
    branchId?: string,
  ): FollowUp[] {
    if (!branchId) {
      return followUps;
    }

    const customerIds = new Set(
      customers
        .filter((customer) => customer.branchId === branchId)
        .map((customer) => customer.id),
    );

    return followUps.filter((followUp) => customerIds.has(followUp.customerId));
  }

  private filterNotificationsByBranch(
    notifications: Array<{ customerId: string | null }>,
    customerBranchMap: Map<string, string>,
    branchId?: string,
  ): Array<{ customerId: string | null; type: NotificationType }> {
    if (!branchId) {
      return notifications as Array<{
        customerId: string | null;
        type: NotificationType;
      }>;
    }

    return (notifications as Array<{
      customerId: string | null;
      type: NotificationType;
    }>).filter((notification) => {
      if (!notification.customerId) {
        return false;
      }
      return customerBranchMap.get(notification.customerId) === branchId;
    });
  }

  private sumRevenue(procedures: Procedure[]): number {
    return Number(
      procedures.reduce((sum, procedure) => sum + procedure.price, 0).toFixed(2),
    );
  }

  private currentMonthRange(reference: Date): {
    monthStart: Date;
    monthEnd: Date;
  } {
    const parts = this.getDateParts(reference);
    const monthStart = new Date(parts.year, parts.month - 1, 1);
    const monthEnd = new Date(parts.year, parts.month, 0, 23, 59, 59, 999);
    return { monthStart, monthEnd };
  }

  private isSameDay(left: Date, right: Date): boolean {
    return this.toDateKey(left) === this.toDateKey(right);
  }

  private toDateKey(date: Date): string {
    return date.toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
  }

  private getDateParts(date: Date): {
    year: number;
    month: number;
    day: number;
  } {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(date);
    return {
      year: Number(parts.find((part) => part.type === 'year')?.value),
      month: Number(parts.find((part) => part.type === 'month')?.value),
      day: Number(parts.find((part) => part.type === 'day')?.value),
    };
  }
}
