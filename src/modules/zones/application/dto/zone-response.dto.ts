import { ApiProperty } from '@nestjs/swagger';
import { NamedEntityDto } from '../../../../shared/dto/named-entity.dto';

export class ZoneResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  deviceId: string;

  @ApiProperty({ nullable: true, description: 'Cihazın tipi/adı' })
  deviceName: string | null;

  @ApiProperty()
  price: number;

  @ApiProperty()
  createdAt: Date;
}

export class ZoneSummaryDto extends NamedEntityDto {}
