import { ApiProperty } from '@nestjs/swagger';
import { NamedEntityDto } from '../../../../shared/dto/named-entity.dto';

export class ProcedureResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty({ nullable: true, description: 'Müştərinin adı soyadı' })
  customerName: string | null;

  @ApiProperty()
  deviceId: string;

  @ApiProperty({ nullable: true, description: 'Cihazın tipi/adı' })
  deviceName: string | null;

  @ApiProperty({ nullable: true })
  packageId: string | null;

  @ApiProperty({ nullable: true, description: 'Paketin adı' })
  packageName: string | null;

  @ApiProperty({ nullable: true })
  campaignId: string | null;

  @ApiProperty({ nullable: true, description: 'Kampaniyanın adı' })
  campaignName: string | null;

  @ApiProperty({ type: [String] })
  zoneIds: string[];

  @ApiProperty({ type: [NamedEntityDto], description: 'Nahiyələrin id və adları' })
  zones: NamedEntityDto[];

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
    nullable: true,
    description: 'Pulsuz verilən nahiyənin adı',
  })
  freeZoneName: string | null;

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
