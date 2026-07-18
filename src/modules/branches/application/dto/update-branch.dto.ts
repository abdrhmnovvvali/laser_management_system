import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { BranchTranslationInputDto } from '../../../../shared/i18n/dto/translation-input.dto';

export class UpdateBranchDto {
  @ApiPropertyOptional({ type: [BranchTranslationInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => BranchTranslationInputDto)
  translations?: BranchTranslationInputDto[];
}
