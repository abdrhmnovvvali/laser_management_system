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
      'Aylıq gəlir, müştəri sayı və digər aggregate göstəricilər (yalnız oxuma)',
  })
  @ApiResponse({ status: 200, type: DashboardSummaryResponseDto })
  async getSummary(
    @Query() query: DashboardSummaryQueryDto,
  ): Promise<DashboardSummaryResponseDto> {
    const summary = await this.getDashboardSummaryUseCase.execute(
      query.branchId,
    );
    return DashboardSummaryMapper.toResponseDto(summary);
  }
}
