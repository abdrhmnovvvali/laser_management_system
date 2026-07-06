import { ApiProperty } from '@nestjs/swagger';

export class ProcedureResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  deviceId: string;

  @ApiProperty({ nullable: true })
  packageId: string | null;

  @ApiProperty({ type: [String] })
  zoneIds: string[];

  @ApiProperty()
  date: Date;

  @ApiProperty()
  declaredShotCount: number;

  @ApiProperty()
  actualShotCount: number;

  @ApiProperty()
  shotCountDifference: number;

  @ApiProperty()
  price: number;

  @ApiProperty({
    description: 'Endirimdən əvvəlki hesablanmış qiymət',
  })
  originalPrice: number;

  @ApiProperty({
    description: 'Bu vizitdə loyallıq endirimi tətbiq olunubmu (məs. hər 7-ci vizit)',
  })
  loyaltyRewardApplied: boolean;

  @ApiProperty({
    nullable: true,
    description: 'Pulsuz verilən nahiyənin ID-si',
  })
  freeZoneId: string | null;

  @ApiProperty({
    description: 'Loyallıq endiriminin məbləği (AZN)',
  })
  discountAmount: number;

  @ApiProperty({
    nullable: true,
    description: 'Müştərinin bu prosedur üzrə vizit nömrəsi (1, 2, 3, ...)',
  })
  visitNumber: number | null;

  @ApiProperty()
  createdAt: Date;
}
