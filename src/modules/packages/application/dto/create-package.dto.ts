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
import { NameTranslationInputDto } from '../../../../shared/i18n/dto/translation-input.dto';

export class CreatePackageDto {
  @ApiProperty({ example: 199.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: ['a1b2...', 'c3d4...'], type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  zoneIds: string[];

  @ApiProperty({ type: [NameTranslationInputDto] })
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => NameTranslationInputDto)
  translations: NameTranslationInputDto[];
}
