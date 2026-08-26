export type DashboardProblemSeverity = 'critical' | 'warning' | 'info';

export interface DashboardPeriod {
  monthStart: Date;
  monthEnd: Date;
  generatedAt: Date;
}

export interface DashboardOverview {
  totalCustomers: number;
  newCustomersThisMonth: number;
  proceduresThisMonth: number;
  proceduresToday: number;
  monthlyRevenue: number;
  todayRevenue: number;
  averageProcedureValueThisMonth: number;
  totalDiscountThisMonth: number;
  loyaltyRewardsThisMonth: number;
}

export interface DashboardOperations {
  totalBranches: number;
  totalDevices: number;
  activeCampaigns: number;
  todaysBirthdays: number;
  followUpsDueToday: number;
  followUpsUpcoming: number;
  followUpsOverdue: number;
  followUpsMissed: number;
}

export interface DashboardUnreadNotifications {
  total: number;
  fraud: number;
  followUp: number;
  birthday: number;
}

export interface DashboardFraudAlert {
  procedureId: string;
  customerId: string;
  branchId: string;
  branchName: string | null;
  declaredShotCount: number;
  actualShotCount: number;
  difference: number;
  date: Date;
}

export interface DashboardAlerts {
  fraudCases: number;
  unreadNotifications: DashboardUnreadNotifications;
  topFraudCases: DashboardFraudAlert[];
}

export interface DashboardBranchStats {
  branchId: string;
  branchName: string;
  customers: number;
  proceduresThisMonth: number;
  monthlyRevenue: number;
  fraudCases: number;
  unreadNotifications: number;
}

export interface DashboardProblem {
  severity: DashboardProblemSeverity;
  type: string;
  message: string;
  count: number;
  branchId?: string;
  branchName?: string;
  threshold?: number;
}

/** Seçilmiş dövrdə ən çox istifadə olunan katalog elementi */
export interface DashboardUsageRankItem {
  id: string;
  name: string | null;
  usageCount: number;
}

export class DashboardSummary {
  constructor(
    public readonly period: DashboardPeriod,
    public readonly overview: DashboardOverview,
    public readonly operations: DashboardOperations,
    public readonly alerts: DashboardAlerts,
    public readonly branches: DashboardBranchStats[],
    public readonly problems: DashboardProblem[],
    public readonly topZones: DashboardUsageRankItem[] = [],
    public readonly topCampaigns: DashboardUsageRankItem[] = [],
    public readonly topPackages: DashboardUsageRankItem[] = [],
  ) {}
}
