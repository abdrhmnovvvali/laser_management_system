import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignTranslationResponseDto } from '../../../../shared/i18n/dto/translation-response.dto';
import { NamedEntityDto } from '../../../../shared/dto/named-entity.dto';
import { DiscountType } from '../../domain/entities/discount-type.enum';

export class CampaignResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Aktiv dilə uyğun ad (Accept-Language)' })
  name: string;

  @ApiProperty({
    nullable: true,
    description: 'Aktiv dilə uyğun təsvir (Accept-Language)',
  })
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

  @ApiPropertyOptional({
    type: [CampaignTranslationResponseDto],
    description: 'Yalnız detail/edit cavabında qaytarılır',
  })
  translations?: CampaignTranslationResponseDto[];
}
