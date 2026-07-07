import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { DiscountType } from '../../domain/entities/discount-type.enum';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Yay Endirimi' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Seçilmiş nahiyələrdə 20% endirim', required: false })
  @IsOptional()
  @IsString()
  description?: string;

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
}
