import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BranchFacade } from '../../../branches/application/branch.facade';
import { GetFraudReportUseCase } from '../../application/use-cases/get-fraud-report.usecase';
import { FraudReportItemResponseDto } from '../../application/dto/fraud-report-item-response.dto';
import { FraudReportQueryDto } from '../../application/dto/fraud-report-query.dto';
import { FraudReportMapper } from '../../application/mappers/fraud-report.mapper';

@ApiTags('FraudDetection')
@ApiBearerAuth('bearerAuth')
@Controller('procedures')
export class FraudReportController {
  constructor(
    private readonly getFraudReportUseCase: GetFraudReportUseCase,
    private readonly branchFacade: BranchFacade,
  ) {}

  @Get('fraud-report')
  @ApiOperation({
    summary:
      'Bəyan edilən və faktiki atış sayı fərqli olan prosedurların siyahısı',
  })
  @ApiResponse({ status: 200, type: [FraudReportItemResponseDto] })
  async getFraudReport(
    @Query() query: FraudReportQueryDto,
  ): Promise<FraudReportItemResponseDto[]> {
    const items = await this.getFraudReportUseCase.execute(query);
    const branchNames = await this.branchFacade.resolveNames(
      items.map((item) => item.branchId),
    );
    return FraudReportMapper.toResponseDtoList(items, branchNames);
  }
}
