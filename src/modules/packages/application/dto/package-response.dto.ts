import { ApiProperty } from '@nestjs/swagger';

export class PackageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ type: [String] })
  zoneIds: string[];

  @ApiProperty()
  createdAt: Date;
}
