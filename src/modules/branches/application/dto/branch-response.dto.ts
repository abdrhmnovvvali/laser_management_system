import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BranchTranslationResponseDto } from '../../../../shared/i18n/dto/translation-response.dto';

export class BranchResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Aktiv dilə uyğun ad (Accept-Language)' })
  name: string;

  @ApiProperty({
    nullable: true,
    description: 'Aktiv dilə uyğun ünvan (Accept-Language)',
  })
  address: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({
    type: [BranchTranslationResponseDto],
    description: 'Yalnız detail/edit cavabında qaytarılır',
  })
  translations?: BranchTranslationResponseDto[];
}
