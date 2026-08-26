import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardPeriodDto {
  @ApiProperty({ description: 'Cari ayın başlanğıc tarixi' })
  monthStart: Date;

  @ApiProperty({ description: 'Cari ayın son tarixi' })
  monthEnd: Date;

  @ApiProperty({ description: 'Hesabatın yaradılma vaxtı' })
  generatedAt: Date;
}

export class DashboardOverviewDto {
  @ApiProperty({ description: 'Ümumi müştəri sayı' })
  totalCustomers: number;

  @ApiProperty({ description: 'Bu ay qeydiyyata alınan yeni müştərilər' })
  newCustomersThisMonth: number;

  @ApiProperty({ description: 'Bu ay aparılan prosedur sayı' })
  proceduresThisMonth: number;

  @ApiProperty({ description: 'Bu gün aparılan prosedur sayı' })
  proceduresToday: number;

  @ApiProperty({ description: 'Bu ayın ümumi gəliri (AZN)' })
  monthlyRevenue: number;

  @ApiProperty({ description: 'Bu günün gəliri (AZN)' })
  todayRevenue: number;

  @ApiProperty({ description: 'Bu ay orta prosedur dəyəri (AZN)' })
  averageProcedureValueThisMonth: number;

  @ApiProperty({ description: 'Bu ay verilən ümumi endirim məbləği (AZN)' })
  totalDiscountThisMonth: number;

  @ApiProperty({ description: 'Bu ay loyallıq mükafatı tətbiq olunan prosedurlar' })
  loyaltyRewardsThisMonth: number;
}

export class DashboardOperationsDto {
  @ApiProperty({ description: 'Filial sayı' })
  totalBranches: number;

  @ApiProperty({ description: 'Cihaz sayı' })
  totalDevices: number;

  @ApiProperty({ description: 'Aktiv kampaniya sayı' })
  activeCampaigns: number;

  @ApiProperty({ description: 'Bu gün ad günü olan müştərilər' })
  todaysBirthdays: number;

  @ApiProperty({ description: 'Bu gün planlaşdırılan gözləyən vizitlər' })
  followUpsDueToday: number;

  @ApiProperty({ description: 'Növbəti 7 gün ərzində planlaşdırılan vizitlər' })
  followUpsUpcoming: number;

  @ApiProperty({ description: 'Tarixi keçmiş, hələ pending olan vizitlər' })
  followUpsOverdue: number;

  @ApiProperty({ description: 'Missed statuslu vizitlər' })
  followUpsMissed: number;
}

export class DashboardUnreadNotificationsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  fraud: number;

  @ApiProperty()
  followUp: number;

  @ApiProperty()
  birthday: number;
}

export class DashboardFraudAlertDto {
  @ApiProperty()
  procedureId: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty({ nullable: true })
  branchName: string | null;

  @ApiProperty()
  declaredShotCount: number;

  @ApiProperty()
  actualShotCount: number;

  @ApiProperty()
  difference: number;

  @ApiProperty()
  date: Date;
}

export class DashboardAlertsDto {
  @ApiProperty({ description: 'Atış sayı uyğunsuzluğu olan prosedurlar' })
  fraudCases: number;

  @ApiProperty({ type: DashboardUnreadNotificationsDto })
  unreadNotifications: DashboardUnreadNotificationsDto;

  @ApiProperty({
    type: [DashboardFraudAlertDto],
    description: 'Ən böyük fərqə görə top fraud halları',
  })
  topFraudCases: DashboardFraudAlertDto[];
}

export class DashboardBranchStatsDto {
  @ApiProperty()
  branchId: string;

  @ApiProperty()
  branchName: string;

  @ApiProperty()
  customers: number;

  @ApiProperty()
  proceduresThisMonth: number;

  @ApiProperty()
  monthlyRevenue: number;

  @ApiProperty()
  fraudCases: number;

  @ApiProperty()
  unreadNotifications: number;
}

export class DashboardProblemDto {
  @ApiProperty({ enum: ['critical', 'warning', 'info'] })
  severity: 'critical' | 'warning' | 'info';

  @ApiProperty({ description: 'Problem tipi (fraud, follow_up_overdue, ...)' })
  type: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  count: number;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiPropertyOptional()
  branchName?: string;

  @ApiPropertyOptional({
    description: 'Fraud threshold kimi əlavə parametr (i18n üçün)',
  })
  threshold?: number;
}

export class DashboardUsageRankItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ description: 'Seçilmiş dövrdə istifadə sayı' })
  usageCount: number;
}

export class DashboardSummaryResponseDto {
  @ApiProperty({ type: DashboardPeriodDto })
  period: DashboardPeriodDto;

  @ApiProperty({ type: DashboardOverviewDto })
  overview: DashboardOverviewDto;

  @ApiProperty({ type: DashboardOperationsDto })
  operations: DashboardOperationsDto;

  @ApiProperty({ type: DashboardAlertsDto })
  alerts: DashboardAlertsDto;

  @ApiProperty({
    type: [DashboardBranchStatsDto],
    description: 'Filial üzrə detallı statistika',
  })
  branches: DashboardBranchStatsDto[];

  @ApiProperty({
    type: [DashboardProblemDto],
    description: 'Admin üçün prioritetləşdirilmiş problem siyahısı',
  })
  problems: DashboardProblemDto[];

  @ApiProperty({
    type: [DashboardUsageRankItemDto],
    description: 'Seçilmiş dövrdə ən çox gəlinən nahiyələr',
  })
  topZones: DashboardUsageRankItemDto[];

  @ApiProperty({
    type: [DashboardUsageRankItemDto],
    description: 'Seçilmiş dövrdə ən çox istifadə olunan kampaniyalar',
  })
  topCampaigns: DashboardUsageRankItemDto[];

  @ApiProperty({
    type: [DashboardUsageRankItemDto],
    description: 'Seçilmiş dövrdə ən çox istifadə olunan paketlər',
  })
  topPackages: DashboardUsageRankItemDto[];
}
