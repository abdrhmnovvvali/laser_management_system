import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  createPaginatedResponseDto,
  createPaginatedResponseDtoClass,
} from '../../../../shared/dto/paginated-response.dto';
import { RelationLookupService } from '../../../../shared/relations/relation-lookup.service';
import { GetFraudReportUseCase } from '../../application/use-cases/get-fraud-report.usecase';
import { FraudReportItemResponseDto } from '../../application/dto/fraud-report-item-response.dto';
import { FraudReportQueryDto } from '../../application/dto/fraud-report-query.dto';
import { FraudReportMapper } from '../../application/mappers/fraud-report.mapper';

const PaginatedFraudReportResponseDto = createPaginatedResponseDtoClass(
  FraudReportItemResponseDto,
  'PaginatedFraudReportResponseDto',
);

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
  @ApiResponse({ status: 200, type: PaginatedFraudReportResponseDto })
  async getFraudReport(@Query() query: FraudReportQueryDto) {
    const result = await this.getFraudReportUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      branchIds: result.items.map((item) => item.branchId),
      customerIds: result.items.map((item) => item.customerId),
      deviceIds: result.items.map((item) => item.deviceId),
    });
    return createPaginatedResponseDto(
      result,
      FraudReportMapper.toResponseDtoList(result.items, lookups),
    );
  }
}
