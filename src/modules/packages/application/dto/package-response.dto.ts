import { ApiProperty } from '@nestjs/swagger';
import { NamedEntityDto } from '../../../../shared/dto/named-entity.dto';

export class PackageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ type: [String] })
  zoneIds: string[];

  @ApiProperty({ type: [NamedEntityDto], description: 'Nahiyələrin id və adları' })
  zones: NamedEntityDto[];

  @ApiProperty()
  createdAt: Date;
}
