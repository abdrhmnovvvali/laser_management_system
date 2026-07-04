import { DomainEvent } from './domain-event.base';

export const EVENT_PUBLISHER = Symbol('IEventPublisher');

/**
 * Outbound port used by use-cases to announce domain events without
 * depending on @nestjs/event-emitter directly (Dependency Inversion).
 */
export interface IEventPublisher {
  publish(event: DomainEvent): void;
}
