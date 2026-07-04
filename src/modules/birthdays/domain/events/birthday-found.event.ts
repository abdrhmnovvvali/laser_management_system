import { DomainEvent } from '../../../../shared/events/domain-event.base';

/**
 * Published (by a daily cron) for every customer whose birthday is today.
 * NotificationModule listens for this to persist a notification.
 */
export class BirthdayFoundEvent extends DomainEvent {
  static readonly EVENT_NAME = 'birthday.found';
  readonly eventName = BirthdayFoundEvent.EVENT_NAME;

  constructor(
    public readonly customerId: string,
    public readonly message: string,
  ) {
    super();
  }
}
