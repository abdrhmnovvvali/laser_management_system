import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateDeviceDto {
  @ApiProperty({ example: 'Alexandrite Laser', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  type?: string;

  @ApiProperty({ example: 120, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  shotCounter?: number;
}
