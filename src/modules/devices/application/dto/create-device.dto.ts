import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { DeviceTranslationInputDto } from '../../../../shared/i18n/dto/translation-input.dto';

export class CreateDeviceDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  shotCounter?: number;

  @ApiProperty({ type: [DeviceTranslationInputDto] })
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => DeviceTranslationInputDto)
  translations: DeviceTranslationInputDto[];
}
