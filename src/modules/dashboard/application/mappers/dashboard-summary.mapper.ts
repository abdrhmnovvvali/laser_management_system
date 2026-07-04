import { DashboardSummary } from '../../domain/entities/dashboard-summary.entity';
import { DashboardSummaryResponseDto } from '../dto/dashboard-summary-response.dto';

export class DashboardSummaryMapper {
  static toResponseDto(summary: DashboardSummary): DashboardSummaryResponseDto {
    const dto = new DashboardSummaryResponseDto();
    dto.totalCustomers = summary.totalCustomers;
    dto.monthlyRevenue = summary.monthlyRevenue;
    dto.todaysBirthdaysCount = summary.todaysBirthdaysCount;
    dto.upcomingFollowUpsCount = summary.upcomingFollowUpsCount;
    dto.activeCampaignsCount = summary.activeCampaignsCount;
    dto.fraudAlertsCount = summary.fraudAlertsCount;
    return dto;
  }
}
