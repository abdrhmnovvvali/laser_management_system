import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Nahiyə üçün seans normaları — null göndərmək sahəni təmizləyir. */
export class ZoneNormsInputDto {
  @ApiPropertyOptional({ example: 1800, nullable: true, description: 'Minimum atış sayı' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minShots?: number | null;

  @ApiPropertyOptional({ example: 2200, nullable: true, description: 'Maksimum atış sayı' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxShots?: number | null;

  @ApiPropertyOptional({ example: 25, nullable: true, description: 'Minimum müddət (dəq)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  minDurationMinutes?: number | null;

  @ApiPropertyOptional({ example: 35, nullable: true, description: 'Maksimum müddət (dəq)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  maxDurationMinutes?: number | null;
}
