import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ZoneNormsInputDto } from './zone-norms-input.dto';
import { NameTranslationInputDto } from '../../../../shared/i18n/dto/translation-input.dto';

export class CreateZoneDto extends ZoneNormsInputDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  deviceId: string;

  @ApiProperty({ example: 25.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ type: [NameTranslationInputDto] })
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => NameTranslationInputDto)
  translations: NameTranslationInputDto[];
}
