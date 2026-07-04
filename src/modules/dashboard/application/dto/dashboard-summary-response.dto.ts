import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryResponseDto {
  @ApiProperty({ description: 'Ümumi müştəri sayı' })
  totalCustomers: number;

  @ApiProperty({
    description: 'Cari ayın gəliri (prosedur qiymətlərinin cəmi)',
  })
  monthlyRevenue: number;

  @ApiProperty({ description: 'Bu gün ad günü olan müştəri sayı' })
  todaysBirthdaysCount: number;

  @ApiProperty({ description: 'Növbəti 7 gün ərzində planlaşdırılan vizitlər' })
  upcomingFollowUpsCount: number;

  @ApiProperty({ description: 'Hazırda aktiv kampaniya sayı' })
  activeCampaignsCount: number;

  @ApiProperty({ description: 'Fraud hesabatındakı uyğunsuzluq sayı' })
  fraudAlertsCount: number;
}
