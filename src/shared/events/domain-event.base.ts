/**
 * Base class for cross-module domain events. Keeping this in `shared` (not
 * inside a specific module's domain layer) lets multiple modules depend on
 * the event name/contract without depending on each other's internals.
 */
export abstract class DomainEvent {
  abstract readonly eventName: string;
  readonly occurredAt: Date = new Date();
}
