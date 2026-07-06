import { ApiProperty } from '@nestjs/swagger';

export class DeviceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty({ nullable: true, description: 'Filialın adı' })
  branchName: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  shotCounter: number;

  @ApiProperty()
  createdAt: Date;
}
