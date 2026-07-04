import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from './domain-event.base';
import { IEventPublisher } from './event-publisher.interface';

@Injectable()
export class NestEventEmitterPublisher implements IEventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish(event: DomainEvent): void {
    this.eventEmitter.emit(event.eventName, event);
  }
}
