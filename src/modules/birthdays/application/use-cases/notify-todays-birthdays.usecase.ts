import { Inject, Injectable, Logger } from '@nestjs/common';
import { EVENT_PUBLISHER } from '../../../../shared/events/event-publisher.interface';
import type { IEventPublisher } from '../../../../shared/events/event-publisher.interface';
import { BirthdayFoundEvent } from '../../domain/events/birthday-found.event';
import { BIRTHDAY_ADMIN_READER } from '../../domain/repositories/birthday-reader.interface';
import type { IBirthdayReader } from '../../domain/repositories/birthday-reader.interface';

/**
 * Publishes a BirthdayFoundEvent for every customer whose birthday is today.
 * Invoked by the daily cron — uses the admin (RLS-bypassing) reader since
 * cron jobs run outside any HTTP request context and must see customers
 * across all branches.
 */
@Injectable()
export class NotifyTodaysBirthdaysUseCase {
  private readonly logger = new Logger(NotifyTodaysBirthdaysUseCase.name);

  constructor(
    @Inject(BIRTHDAY_ADMIN_READER)
    private readonly birthdayAdminReader: IBirthdayReader,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(): Promise<number> {
    const { items: birthdays } =
      await this.birthdayAdminReader.findTodaysBirthdays();

    for (const customer of birthdays) {
      this.eventPublisher.publish(
        new BirthdayFoundEvent(customer.customerId, customer.fullName),
      );
    }

    this.logger.log(`${birthdays.length} ad günü bildirişi göndərildi`);
    return birthdays.length;
  }
}
