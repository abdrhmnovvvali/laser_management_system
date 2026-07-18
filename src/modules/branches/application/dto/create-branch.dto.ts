import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { BranchTranslationInputDto } from '../../../../shared/i18n/dto/translation-input.dto';

export class CreateBranchDto {
  @ApiProperty({ type: [BranchTranslationInputDto] })
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => BranchTranslationInputDto)
  translations: BranchTranslationInputDto[];
}
