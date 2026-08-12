import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardSummaryQueryDto } from '../../application/dto/dashboard-summary-query.dto';
import { DashboardSummaryResponseDto } from '../../application/dto/dashboard-summary-response.dto';
import { DashboardSummaryMapper } from '../../application/mappers/dashboard-summary.mapper';
import { GetDashboardSummaryUseCase } from '../../application/use-cases/get-dashboard-summary.usecase';

@ApiTags('Dashboard')
@ApiBearerAuth('bearerAuth')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary:
      'Admin dashboard — KPI-lar, problemlər, filial üzrə statistika və alert-lər',
  })
  @ApiResponse({ status: 200, type: DashboardSummaryResponseDto })
  async getSummary(
    @Query() query: DashboardSummaryQueryDto,
  ): Promise<DashboardSummaryResponseDto> {
    const summary = await this.getDashboardSummaryUseCase.execute({
      branchId: query.branchId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
    return DashboardSummaryMapper.toResponseDto(summary);
  }
}
