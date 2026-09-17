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
import { ListReturnDueQueryDto } from '../../application/dto/list-return-due-query.dto';
import { ReturnDueCustomerResponseDto } from '../../application/dto/return-due-customer-response.dto';
import { ReturnDueMapper } from '../../application/mappers/return-due.mapper';
import { ListReturnDueCustomersUseCase } from '../../application/use-cases/list-return-due-customers.usecase';

const PaginatedReturnDueResponseDto = createPaginatedResponseDtoClass(
  ReturnDueCustomerResponseDto,
  'PaginatedReturnDueResponseDto',
);

@ApiTags('Return reminders')
@ApiBearerAuth('bearerAuth')
@Controller('notifications/return-due')
export class ReturnRemindersController {
  constructor(
    private readonly listReturnDueCustomersUseCase: ListReturnDueCustomersUseCase,
    private readonly relationLookupService: RelationLookupService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Təkrar vizit vaxtı çatmış müştərilər — son proseduru minDays–maxDays gün əvvəl olanlar',
  })
  @ApiResponse({ status: 200, type: PaginatedReturnDueResponseDto })
  async findDueForReturn(@Query() query: ListReturnDueQueryDto) {
    const result = await this.listReturnDueCustomersUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      branchIds: result.items.map((customer) => customer.branchId),
    });
    return createPaginatedResponseDto(
      result,
      ReturnDueMapper.toResponseDtoList(result.items, lookups),
    );
  }
}
