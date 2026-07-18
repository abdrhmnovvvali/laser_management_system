import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { NameTranslationInputDto } from '../../../../shared/i18n/dto/translation-input.dto';

export class UpdatePackageDto {
  @ApiPropertyOptional({ example: 199.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: ['a1b2...', 'c3d4...'], type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  zoneIds?: string[];

  @ApiPropertyOptional({ type: [NameTranslationInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => NameTranslationInputDto)
  translations?: NameTranslationInputDto[];
}
