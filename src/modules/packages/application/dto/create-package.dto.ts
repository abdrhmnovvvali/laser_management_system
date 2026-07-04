import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ example: 'Tam Bədən Paketi' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 199.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: ['a1b2...', 'c3d4...'], type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  zoneIds: string[];
}
