import { DomainEvent } from '../../../../shared/events/domain-event.base';

/**
 * Published after a procedure is successfully recorded. Consumed by
 * FraudDetectionModule (shot-count mismatch check) without ProcedureModule
 * needing to know that module exists.
 */
export class ProcedureCompletedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'procedure.completed';
  readonly eventName = ProcedureCompletedEvent.EVENT_NAME;

  constructor(
    public readonly procedureId: string,
    public readonly customerId: string,
    public readonly deviceId: string,
    public readonly declaredShotCount: number,
    public readonly actualShotCount: number,
    public readonly date: Date,
  ) {
    super();
  }
}
