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

  @ApiProperty()
  createdAt: Date;
}
