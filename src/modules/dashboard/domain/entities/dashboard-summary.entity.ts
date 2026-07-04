export class DashboardSummary {
  constructor(
    public readonly totalCustomers: number,
    public readonly monthlyRevenue: number,
    public readonly todaysBirthdaysCount: number,
    public readonly upcomingFollowUpsCount: number,
    public readonly activeCampaignsCount: number,
    public readonly fraudAlertsCount: number,
  ) {}
}
