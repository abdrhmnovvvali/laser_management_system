import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { ZoneNormsInputDto } from './zone-norms-input.dto';
import { NameTranslationInputDto } from '../../../../shared/i18n/dto/translation-input.dto';

export class UpdateZoneDto extends ZoneNormsInputDto {
  @ApiPropertyOptional({ example: 25.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ type: [NameTranslationInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => NameTranslationInputDto)
  translations?: NameTranslationInputDto[];
}
