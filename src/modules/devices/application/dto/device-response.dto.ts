import { ApiProperty } from '@nestjs/swagger';

export class DeviceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  shotCounter: number;

  @ApiProperty()
  createdAt: Date;
}
