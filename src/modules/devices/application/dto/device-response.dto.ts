import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceTranslationResponseDto } from '../../../../shared/i18n/dto/translation-response.dto';

export class DeviceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty({ nullable: true, description: 'Filialın adı' })
  branchName: string | null;

  @ApiProperty({ description: 'Aktiv dilə uyğun tip (Accept-Language)' })
  type: string;

  @ApiProperty()
  shotCounter: number;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({
    type: [DeviceTranslationResponseDto],
    description: 'Yalnız detail/edit cavabında qaytarılır',
  })
  translations?: DeviceTranslationResponseDto[];
}
