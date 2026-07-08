import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RelationLookupService } from '../../../../shared/relations/relation-lookup.service';
import { ListTodaysBirthdaysUseCase } from '../../application/use-cases/list-todays-birthdays.usecase';
import { BirthdayCustomerResponseDto } from '../../application/dto/birthday-customer-response.dto';
import { BirthdayMapper } from '../../application/mappers/birthday.mapper';

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
  @ApiResponse({ status: 200, type: [BirthdayCustomerResponseDto] })
  async findTodaysBirthdays(): Promise<BirthdayCustomerResponseDto[]> {
    const customers = await this.listTodaysBirthdaysUseCase.execute();
    const lookups = await this.relationLookupService.load({
      branchIds: customers.map((customer) => customer.branchId),
    });
    return BirthdayMapper.toResponseDtoList(customers, lookups);
  }
}
