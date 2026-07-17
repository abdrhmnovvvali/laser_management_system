import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NameTranslationResponseDto } from '../../../../shared/i18n/dto/translation-response.dto';
import { NamedEntityDto } from '../../../../shared/dto/named-entity.dto';

export class ZoneResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Aktiv dilə uyğun ad (Accept-Language)' })
  name: string;

  @ApiProperty()
  deviceId: string;

  @ApiProperty({ nullable: true, description: 'Cihazın tipi/adı' })
  deviceName: string | null;

  @ApiProperty()
  price: number;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({
    type: [NameTranslationResponseDto],
    description: 'Yalnız detail/edit cavabında qaytarılır',
  })
  translations?: NameTranslationResponseDto[];
}

export class ZoneSummaryDto extends NamedEntityDto {}
