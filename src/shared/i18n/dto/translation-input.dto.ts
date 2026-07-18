import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Locale } from '../locale.enum';

export class NameTranslationInputDto {
  @ApiProperty({ enum: Locale, example: Locale.AZ })
  @IsEnum(Locale)
  locale: Locale;

  @ApiProperty({ example: 'Qoltuqaltı' })
  @IsString()
  @MinLength(1)
  name: string;
}

export class BranchTranslationInputDto {
  @ApiProperty({ enum: Locale, example: Locale.AZ })
  @IsEnum(Locale)
  locale: Locale;

  @ApiProperty({ example: 'Nizami filialı' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'Bakı, Nizami küç.' })
  @IsOptional()
  @IsString()
  address?: string | null;
}

export class DeviceTranslationInputDto {
  @ApiProperty({ enum: Locale, example: Locale.AZ })
  @IsEnum(Locale)
  locale: Locale;

  @ApiProperty({ example: 'Alexandrite' })
  @IsString()
  @MinLength(1)
  type: string;
}

export class CampaignTranslationInputDto {
  @ApiProperty({ enum: Locale, example: Locale.AZ })
  @IsEnum(Locale)
  locale: Locale;

  @ApiProperty({ example: 'Yay endirimi' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'Bütün nahiyələrə 20% endirim' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
