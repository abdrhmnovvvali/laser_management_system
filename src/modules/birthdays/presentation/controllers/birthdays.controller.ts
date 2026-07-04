import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ListTodaysBirthdaysUseCase } from '../../application/use-cases/list-todays-birthdays.usecase';
import { BirthdayCustomerResponseDto } from '../../application/dto/birthday-customer-response.dto';
import { BirthdayMapper } from '../../application/mappers/birthday.mapper';

@ApiTags('Birthdays')
@ApiBearerAuth('bearerAuth')
@Controller('notifications/birthdays')
export class BirthdaysController {
  constructor(
    private readonly listTodaysBirthdaysUseCase: ListTodaysBirthdaysUseCase,
  ) {}

  @Get('today')
  @ApiOperation({
    summary:
      'Bu gün ad günü olan müştərilər (gündəlik cron nəticəsini əl ilə yoxlamaq üçün)',
  })
  @ApiResponse({ status: 200, type: [BirthdayCustomerResponseDto] })
  async findTodaysBirthdays(): Promise<BirthdayCustomerResponseDto[]> {
    const customers = await this.listTodaysBirthdaysUseCase.execute();
    return BirthdayMapper.toResponseDtoList(customers);
  }
}
