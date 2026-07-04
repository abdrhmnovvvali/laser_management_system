import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateZoneDto {
  @ApiProperty({ example: 'Qoltuqaltı', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({ example: 25.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
