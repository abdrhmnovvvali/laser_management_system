import { ApiProperty } from '@nestjs/swagger';

export class ZoneResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  createdAt: Date;
}
