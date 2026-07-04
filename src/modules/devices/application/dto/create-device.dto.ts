import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: 'Alexandrite Laser' })
  @IsString()
  @MinLength(2)
  type: string;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  shotCounter?: number;
}
