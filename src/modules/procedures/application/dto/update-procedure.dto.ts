import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateProcedureDto {
  @ApiProperty({ example: '2026-07-03', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  declaredShotCount?: number;

  @ApiProperty({ example: 22, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  actualShotCount?: number;
}
