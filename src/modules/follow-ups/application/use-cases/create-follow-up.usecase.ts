import { Inject, Injectable } from '@nestjs/common';
import { EVENT_PUBLISHER } from '../../../../shared/events/event-publisher.interface';
import type { IEventPublisher } from '../../../../shared/events/event-publisher.interface';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';
import { FollowUpDueEvent } from '../../domain/events/follow-up-due.event';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type {
  CreateFollowUpData,
  IFollowUpRepository,
} from '../../domain/repositories/follow-up.repository.interface';
import { FollowUp } from '../../domain/entities/follow-up.entity';
import { FollowUpReservationValidator } from '../services/follow-up-reservation.validator';

@Injectable()
export class CreateFollowUpUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
    private readonly reservationValidator: FollowUpReservationValidator,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(data: CreateFollowUpData): Promise<FollowUp> {
    await this.reservationValidator.validate({
      customerId: data.customerId,
      deviceId: data.deviceId,
      plannedDate: data.plannedDate,
      plannedTime: data.plannedTime,
      zoneIds: data.zoneIds,
      status: data.status,
    });

    const followUp = await this.followUpRepository.create({
      ...data,
      zoneIds: data.zoneIds,
    });

    const effectiveStatus = data.status ?? FollowUpStatus.PENDING;
    if (
      effectiveStatus === FollowUpStatus.PENDING &&
      this.isDueOnOrBeforeToday(followUp.plannedDate)
    ) {
      this.eventPublisher.publish(
        new FollowUpDueEvent(followUp.id, followUp.customerId, followUp.plannedDate),
      );
    }

    return followUp;
  }

  private isDueOnOrBeforeToday(plannedDate: Date): boolean {
    const today = new Date().toISOString().slice(0, 10);
    const planned = plannedDate.toISOString().slice(0, 10);
    return planned <= today;
  }
}
