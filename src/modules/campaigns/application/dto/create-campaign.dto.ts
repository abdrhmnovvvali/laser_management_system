import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { CampaignTranslationInputDto } from '../../../../shared/i18n/dto/translation-input.dto';
import { DiscountType } from '../../domain/entities/discount-type.enum';

export class CreateCampaignDto {
  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-08-31' })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: ['a1b2...', 'c3d4...'],
    type: [String],
    description: 'Kampaniyanın tətbiq olunduğu nahiyələr',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  zoneIds: string[];

  @ApiProperty({ type: [CampaignTranslationInputDto] })
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => CampaignTranslationInputDto)
  translations: CampaignTranslationInputDto[];
}
