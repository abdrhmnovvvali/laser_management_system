import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_PUBLISHER } from '../../../../shared/events/event-publisher.interface';
import type { IEventPublisher } from '../../../../shared/events/event-publisher.interface';
import { ProcedureCompletedEvent } from '../../../procedures/domain/events/procedure-completed.event';
import { FraudDetectedEvent } from '../../domain/events/fraud-detected.event';

/**
 * Reacts to every completed procedure and raises a FraudDetectedEvent when
 * the actual shot count differs from the declared one. No blocking is
 * performed automatically — this only surfaces the discrepancy (see spec §11).
 */
@Injectable()
export class ProcedureCompletedListener {
  private readonly logger = new Logger(ProcedureCompletedListener.name);

  constructor(
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
  ) {}

  @OnEvent(ProcedureCompletedEvent.EVENT_NAME)
  handle(event: ProcedureCompletedEvent): void {
    const difference = event.actualShotCount - event.declaredShotCount;
    if (difference === 0) {
      return;
    }

    this.logger.warn(
      `Atış sayı fərqi aşkarlandı: procedure=${event.procedureId}, fərq=${difference}`,
    );

    const message =
      difference > 0
        ? `Faktiki atış sayı bəyan edilən sayı ${difference} vahid üstələyir (prosedur: ${event.procedureId})`
        : `Faktiki atış sayı bəyan edilən sayıdan ${Math.abs(difference)} vahid azdır (prosedur: ${event.procedureId})`;

    this.eventPublisher.publish(
      new FraudDetectedEvent(event.procedureId, event.customerId, message),
    );
  }
}
