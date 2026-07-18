import { Injectable } from '@nestjs/common';
import { BirthdayCustomer } from '../domain/entities/birthday-customer.entity';
import { ListTodaysBirthdaysUseCase } from './use-cases/list-todays-birthdays.usecase';

/**
 * Public surface for other modules (Dashboard) needing read access to
 * today's birthdays without depending on BirthdayModule's internals.
 */
@Injectable()
export class BirthdayFacade {
  constructor(
    private readonly listTodaysBirthdaysUseCase: ListTodaysBirthdaysUseCase,
  ) {}

  async listToday(): Promise<BirthdayCustomer[]> {
    const result = await this.listTodaysBirthdaysUseCase.execute(undefined, {
      skipPagination: true,
    });
    return result.items;
  }
}
