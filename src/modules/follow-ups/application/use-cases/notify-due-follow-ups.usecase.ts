import { Inject, Injectable, Logger } from '@nestjs/common';
import { EVENT_PUBLISHER } from '../../../../shared/events/event-publisher.interface';
import type { IEventPublisher } from '../../../../shared/events/event-publisher.interface';
import { FollowUpDueEvent } from '../../domain/events/follow-up-due.event';
import { FOLLOW_UP_ADMIN_READER } from '../../domain/repositories/follow-up-admin-reader.interface';
import type { IFollowUpAdminReader } from '../../domain/repositories/follow-up-admin-reader.interface';

/**
 * Publishes a FollowUpDueEvent for every follow-up planned for today.
 * Invoked by the daily cron (application/cron) — kept as its own use-case so
 * it can also be triggered manually/tested without the scheduler. Uses the
 * admin (RLS-bypassing) read port since cron jobs run outside any HTTP
 * request context and must see follow-ups across all branches.
 */
@Injectable()
export class NotifyDueFollowUpsUseCase {
  private readonly logger = new Logger(NotifyDueFollowUpsUseCase.name);

  constructor(
    @Inject(FOLLOW_UP_ADMIN_READER)
    private readonly followUpAdminReader: IFollowUpAdminReader,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(): Promise<number> {
    const dueToday = await this.followUpAdminReader.findDueOn(new Date());

    for (const followUp of dueToday) {
      this.eventPublisher.publish(
        new FollowUpDueEvent(
          followUp.id,
          followUp.customerId,
          followUp.plannedDate,
        ),
      );
    }

    this.logger.log(`${dueToday.length} yaxınlaşan vizit bildirişi göndərildi`);
    return dueToday.length;
  }
}
