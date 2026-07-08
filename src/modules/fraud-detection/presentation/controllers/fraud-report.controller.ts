import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RelationLookupService } from '../../../../shared/relations/relation-lookup.service';
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
    private readonly relationLookupService: RelationLookupService,
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
    const lookups = await this.relationLookupService.load({
      branchIds: items.map((item) => item.branchId),
      customerIds: items.map((item) => item.customerId),
      deviceIds: items.map((item) => item.deviceId),
    });
    return FraudReportMapper.toResponseDtoList(items, lookups);
  }
}
