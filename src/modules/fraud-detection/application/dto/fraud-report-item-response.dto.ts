import { ApiProperty } from '@nestjs/swagger';

export class FraudReportItemResponseDto {
  @ApiProperty()
  procedureId: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  deviceId: string;

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
