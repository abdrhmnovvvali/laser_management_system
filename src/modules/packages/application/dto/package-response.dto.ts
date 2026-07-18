import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NameTranslationResponseDto } from '../../../../shared/i18n/dto/translation-response.dto';
import { NamedEntityDto } from '../../../../shared/dto/named-entity.dto';

export class PackageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Aktiv dilə uyğun ad (Accept-Language)' })
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ type: [String] })
  zoneIds: string[];

  @ApiProperty({ type: [NamedEntityDto], description: 'Nahiyələrin id və adları' })
  zones: NamedEntityDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({
    type: [NameTranslationResponseDto],
    description: 'Yalnız detail/edit cavabında qaytarılır',
  })
  translations?: NameTranslationResponseDto[];
}
