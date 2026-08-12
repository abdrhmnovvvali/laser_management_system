import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { EVENT_PUBLISHER } from '../../../../shared/events/event-publisher.interface';
import type { IEventPublisher } from '../../../../shared/events/event-publisher.interface';
import { CustomerFacade } from '../../../customers/application/customer.facade';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';
import { FollowUpDueEvent } from '../../domain/events/follow-up-due.event';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type {
  CreateFollowUpData,
  IFollowUpRepository,
} from '../../domain/repositories/follow-up.repository.interface';
import { FollowUp } from '../../domain/entities/follow-up.entity';

@Injectable()
export class CreateFollowUpUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
    private readonly customerFacade: CustomerFacade,
    private readonly zoneFacade: ZoneFacade,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(data: CreateFollowUpData): Promise<FollowUp> {
    await this.customerFacade.getById(data.customerId);
    await this.assertZonesExist(data.zoneIds);

    const followUp = await this.followUpRepository.create({
      ...data,
      zoneIds: data.zoneIds ?? [],
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

  private async assertZonesExist(zoneIds?: string[]): Promise<void> {
    if (!zoneIds?.length) {
      return;
    }

    const zones = await this.zoneFacade.getByIds(zoneIds);
    if (zones.length !== zoneIds.length) {
      throw new BusinessRuleViolationException(
        'Seçilən nahiyələrdən biri və ya bir neçəsi tapılmadı',
      );
    }
  }

  private isDueOnOrBeforeToday(plannedDate: Date): boolean {
    const today = new Date().toISOString().slice(0, 10);
    const planned = plannedDate.toISOString().slice(0, 10);
    return planned <= today;
  }
}
