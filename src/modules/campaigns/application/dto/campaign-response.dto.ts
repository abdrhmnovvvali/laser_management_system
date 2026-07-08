import { ApiProperty } from '@nestjs/swagger';
import { NamedEntityDto } from '../../../../shared/dto/named-entity.dto';
import { DiscountType } from '../../domain/entities/discount-type.enum';

export class CampaignResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ enum: DiscountType })
  discountType: DiscountType;

  @ApiProperty()
  discountValue: number;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [String] })
  zoneIds: string[];

  @ApiProperty({ type: [NamedEntityDto], description: 'Nahiyələrin id və adları' })
  zones: NamedEntityDto[];

  @ApiProperty()
  createdAt: Date;
}
