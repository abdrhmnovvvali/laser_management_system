import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class DashboardSummaryQueryDto {
  @ApiPropertyOptional({
    description:
      'Filiala görə süzgəc (admin üçün; filial işçisi üçün RLS artıq öz filialına məhdudlaşdırır)',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Tarix aralığının başlanğıcı (ISO date). Məs: ?dateFrom=2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Tarix aralığının sonu (ISO date). Məs: ?dateTo=2026-01-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
