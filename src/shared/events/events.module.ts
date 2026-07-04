import { Global, Module } from '@nestjs/common';
import { EVENT_PUBLISHER } from './event-publisher.interface';
import { NestEventEmitterPublisher } from './nest-event-emitter.publisher';

@Global()
@Module({
  providers: [
    { provide: EVENT_PUBLISHER, useClass: NestEventEmitterPublisher },
  ],
  exports: [EVENT_PUBLISHER],
})
export class EventsModule {}
