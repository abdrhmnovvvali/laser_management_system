import { DomainEvent } from '../../../../shared/events/domain-event.base';

/**
 * Published (by a daily cron) for every follow-up whose planned date has
 * arrived. NotificationModule listens for this to persist a notification.
 */
export class FollowUpDueEvent extends DomainEvent {
  static readonly EVENT_NAME = 'followup.due';
  readonly eventName = FollowUpDueEvent.EVENT_NAME;

  constructor(
    public readonly followUpId: string,
    public readonly customerId: string,
    public readonly plannedDate: Date,
  ) {
    super();
  }
}
