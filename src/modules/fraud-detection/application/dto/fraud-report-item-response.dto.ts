import { ApiProperty } from '@nestjs/swagger';

export class FraudReportItemResponseDto {
  @ApiProperty()
  procedureId: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty({ nullable: true, description: 'Müştərinin adı soyadı' })
  customerName: string | null;

  @ApiProperty()
  deviceId: string;

  @ApiProperty({ nullable: true, description: 'Cihazın tipi/adı' })
  deviceName: string | null;

  @ApiProperty()
  branchId: string;

  @ApiProperty({ nullable: true, description: 'Filialın adı' })
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
