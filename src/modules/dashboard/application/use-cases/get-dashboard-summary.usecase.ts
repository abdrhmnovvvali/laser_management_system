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
import { PackageFacade } from '../../../packages/application/package.facade';
import { Procedure } from '../../../procedures/domain/entities/procedure.entity';
import { ProcedureFacade } from '../../../procedures/application/procedure.facade';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import {
  DashboardAlerts,
  DashboardBranchStats,
  DashboardOperations,
  DashboardOverview,
  DashboardPeriod,
  DashboardProblem,
  DashboardProblemSeverity,
  DashboardSummary,
  DashboardUsageRankItem,
} from '../../domain/entities/dashboard-summary.entity';

const UPCOMING_FOLLOW_UP_WINDOW_DAYS = 7;
const TOP_FRAUD_CASES_LIMIT = 200;
const TOP_USAGE_LIMIT = 10;
const TIME_ZONE = 'Asia/Baku';

export interface GetDashboardSummaryInput {
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    private readonly customerFacade: CustomerFacade,
    private readonly procedureFacade: ProcedureFacade,
    private readonly birthdayFacade: BirthdayFacade,
    private readonly followUpFacade: FollowUpFacade,
    private readonly campaignFacade: CampaignFacade,
    private readonly packageFacade: PackageFacade,
    private readonly zoneFacade: ZoneFacade,
    private readonly fraudReportFacade: FraudReportFacade,
    private readonly branchFacade: BranchFacade,
    private readonly deviceFacade: DeviceFacade,
    private readonly notificationFacade: NotificationFacade,
  ) {}

  async execute(input: GetDashboardSummaryInput = {}): Promise<DashboardSummary> {
    const { branchId, dateFrom, dateTo } = input;
    const generatedAt = new Date();
    const { monthStart, monthEnd } = this.resolvePeriodRange(
      generatedAt,
      dateFrom,
      dateTo,
    );
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
      fraudAlertsRaw,
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

    const fraudAlerts = this.filterFraudByPeriod(
      fraudAlertsRaw,
      monthStart,
      monthEnd,
    );

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
    });

    const [topZones, topCampaigns, topPackages] = await Promise.all([
      this.buildTopZones(monthlyProcedures),
      this.buildTopCampaigns(monthlyProcedures),
      this.buildTopPackages(monthlyProcedures),
    ]);

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
      topZones,
      topCampaigns,
      topPackages,
    );
  }

  private async buildTopZones(
    procedures: Procedure[],
  ): Promise<DashboardUsageRankItem[]> {
    const counts = new Map<string, number>();

    for (const procedure of procedures) {
      const zoneIds = new Set(procedure.zoneIds ?? []);
      if (procedure.freeZoneId) {
        zoneIds.add(procedure.freeZoneId);
      }
      for (const zoneId of zoneIds) {
        counts.set(zoneId, (counts.get(zoneId) ?? 0) + 1);
      }
    }

    const ranked = this.rankCounts(counts);
    const names = await this.zoneFacade.resolveNames(ranked.map((item) => item.id));

    return ranked.map((item) => ({
      id: item.id,
      name: names.get(item.id) ?? null,
      usageCount: item.usageCount,
    }));
  }

  private async buildTopCampaigns(
    procedures: Procedure[],
  ): Promise<DashboardUsageRankItem[]> {
    const counts = new Map<string, number>();

    for (const procedure of procedures) {
      if (!procedure.campaignId) {
        continue;
      }
      counts.set(
        procedure.campaignId,
        (counts.get(procedure.campaignId) ?? 0) + 1,
      );
    }

    const ranked = this.rankCounts(counts);
    const names = await this.campaignFacade.resolveNames(
      ranked.map((item) => item.id),
    );

    return ranked.map((item) => ({
      id: item.id,
      name: names.get(item.id) ?? null,
      usageCount: item.usageCount,
    }));
  }

  private async buildTopPackages(
    procedures: Procedure[],
  ): Promise<DashboardUsageRankItem[]> {
    const counts = new Map<string, number>();

    for (const procedure of procedures) {
      if (!procedure.packageId) {
        continue;
      }
      counts.set(
        procedure.packageId,
        (counts.get(procedure.packageId) ?? 0) + 1,
      );
    }

    const ranked = this.rankCounts(counts);
    const names = await this.packageFacade.resolveNames(
      ranked.map((item) => item.id),
    );

    return ranked.map((item) => ({
      id: item.id,
      name: names.get(item.id) ?? null,
      usageCount: item.usageCount,
    }));
  }

  private rankCounts(
    counts: Map<string, number>,
  ): Array<{ id: string; usageCount: number }> {
    return [...counts.entries()]
      .map(([id, usageCount]) => ({ id, usageCount }))
      .sort((left, right) => right.usageCount - left.usageCount)
      .slice(0, TOP_USAGE_LIMIT);
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
  }): DashboardProblem[] {
    const problems: DashboardProblem[] = [];
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

  private resolvePeriodRange(
    reference: Date,
    dateFrom?: string,
    dateTo?: string,
  ): {
    monthStart: Date;
    monthEnd: Date;
  } {
    if (dateFrom || dateTo) {
      const defaultRange = this.currentMonthRange(reference);
      const monthStart = dateFrom
        ? this.parseDateStart(dateFrom)
        : defaultRange.monthStart;
      const monthEnd = dateTo
        ? this.parseDateEnd(dateTo)
        : defaultRange.monthEnd;
      return { monthStart, monthEnd };
    }

    return this.currentMonthRange(reference);
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

  private parseDateStart(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  private parseDateEnd(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }

  private filterFraudByPeriod(
    fraudAlerts: FraudReportItem[],
    periodStart: Date,
    periodEnd: Date,
  ): FraudReportItem[] {
    const startKey = this.toDateKey(periodStart);
    const endKey = this.toDateKey(periodEnd);

    return fraudAlerts.filter((item) => {
      const key = this.toDateKey(item.date);
      return key >= startKey && key <= endKey;
    });
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
