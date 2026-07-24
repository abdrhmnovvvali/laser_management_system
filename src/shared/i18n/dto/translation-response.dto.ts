import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Locale } from '../locale.enum';

export class NameTranslationResponseDto {
  @ApiProperty({ enum: Locale })
  locale: Locale;

  @ApiProperty()
  name: string;
}

export class BranchTranslationResponseDto {
  @ApiProperty({ enum: Locale })
  locale: Locale;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  address: string | null;
}

export class DeviceTranslationResponseDto {
  @ApiProperty({ enum: Locale })
  locale: Locale;

  @ApiProperty()
  type: string;
}

export class CampaignTranslationResponseDto {
  @ApiProperty({ enum: Locale })
  locale: Locale;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;
}

export class NotificationTranslationResponseDto {
  @ApiProperty({ enum: Locale })
  locale: Locale;

  @ApiProperty()
  message: string;
}
