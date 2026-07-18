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
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import { RelationLookupService } from '../../../../shared/relations/relation-lookup.service';
import { ListTodaysBirthdaysUseCase } from '../../application/use-cases/list-todays-birthdays.usecase';
import { BirthdayCustomerResponseDto } from '../../application/dto/birthday-customer-response.dto';
import { BirthdayMapper } from '../../application/mappers/birthday.mapper';

const PaginatedBirthdaysResponseDto = createPaginatedResponseDtoClass(
  BirthdayCustomerResponseDto,
  'PaginatedBirthdaysResponseDto',
);

@ApiTags('Birthdays')
@ApiBearerAuth('bearerAuth')
@Controller('notifications/birthdays')
export class BirthdaysController {
  constructor(
    private readonly listTodaysBirthdaysUseCase: ListTodaysBirthdaysUseCase,
    private readonly relationLookupService: RelationLookupService,
  ) {}

  @Get('today')
  @ApiOperation({
    summary:
      'Bu gün ad günü olan müştərilər (gündəlik cron nəticəsini əl ilə yoxlamaq üçün)',
  })
  @ApiResponse({ status: 200, type: PaginatedBirthdaysResponseDto })
  async findTodaysBirthdays(@Query() query: PaginationQueryDto) {
    const result = await this.listTodaysBirthdaysUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      branchIds: result.items.map((customer) => customer.branchId),
    });
    return createPaginatedResponseDto(
      result,
      BirthdayMapper.toResponseDtoList(result.items, lookups),
    );
  }
}
