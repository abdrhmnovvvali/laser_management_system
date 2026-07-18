import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { EVENT_PUBLISHER } from '../../../../shared/events/event-publisher.interface';
import type { IEventPublisher } from '../../../../shared/events/event-publisher.interface';
import { BirthdayFoundEvent } from '../../../birthdays/domain/events/birthday-found.event';
import { BranchFacade } from '../../../branches/application/branch.facade';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import type {
  CreateCustomerData,
  ICustomerRepository,
} from '../../domain/repositories/customer.repository.interface';
import { Customer } from '../../domain/entities/customer.entity';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    private readonly branchFacade: BranchFacade,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(data: CreateCustomerData): Promise<Customer> {
    const branchExists = await this.branchFacade.exists(data.branchId);
    if (!branchExists) {
      throw new BusinessRuleViolationException(
        `Filial tapılmadı (id: ${data.branchId})`,
      );
    }

    const customer = await this.customerRepository.create(data);

    if (data.birthDate && this.isBirthdayToday(data.birthDate)) {
      this.eventPublisher.publish(
        new BirthdayFoundEvent(
          customer.id,
          `Bu gün ${customer.firstName} ${customer.lastName} adlı müştərinin ad günüdür`,
        ),
      );
    }

    return customer;
  }

  private isBirthdayToday(birthDate: Date): boolean {
    const timeZone = 'Asia/Baku';
    return (
      this.toMonthDay(birthDate, timeZone) === this.toMonthDay(new Date(), timeZone)
    );
  }

  private toMonthDay(date: Date, timeZone: string): string {
    return date.toLocaleDateString('en-CA', { timeZone }).slice(5);
  }
}
