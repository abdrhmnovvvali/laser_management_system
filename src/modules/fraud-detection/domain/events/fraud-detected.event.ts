import { DomainEvent } from '../../../../shared/events/domain-event.base';

/**
 * Published when a procedure's declared vs actual shot count mismatch is
 * detected. NotificationModule listens for this to persist a notification —
 * FraudDetectionModule never writes to the notifications table directly.
 */
export class FraudDetectedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'fraud.detected';
  readonly eventName = FraudDetectedEvent.EVENT_NAME;

  constructor(
    public readonly procedureId: string,
    public readonly customerId: string,
    public readonly message: string,
  ) {
    super();
  }
}
