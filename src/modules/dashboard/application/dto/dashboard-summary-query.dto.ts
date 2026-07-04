import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class DashboardSummaryQueryDto {
  @ApiPropertyOptional({
    description:
      'Filiala görə süzgəc (admin üçün; filial işçisi üçün RLS artıq öz filialına məhdudlaşdırır)',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
