import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { DeviceTranslationInputDto } from '../../../../shared/i18n/dto/translation-input.dto';

export class UpdateDeviceDto {
  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  shotCounter?: number;

  @ApiPropertyOptional({ type: [DeviceTranslationInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => DeviceTranslationInputDto)
  translations?: DeviceTranslationInputDto[];
}
