import { ApiProperty } from '@nestjs/swagger';
import { NamedEntityDto } from './named-entity.dto';

export class PricedEntityDto extends NamedEntityDto {
  @ApiProperty({ nullable: true, description: 'Nahiyənin qiyməti' })
  price: number | null;
}
