import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type {
  IFollowUpRepository,
  UpdateFollowUpData,
} from '../../domain/repositories/follow-up.repository.interface';
import { FollowUp } from '../../domain/entities/follow-up.entity';
import { FollowUpReservationValidator } from '../services/follow-up-reservation.validator';

@Injectable()
export class UpdateFollowUpUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
    private readonly reservationValidator: FollowUpReservationValidator,
  ) {}

  async execute(id: string, data: UpdateFollowUpData): Promise<FollowUp> {
    const existing = await this.followUpRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('FollowUp', id);
    }

    const merged = {
      customerId: existing.customerId,
      deviceId: data.deviceId ?? existing.deviceId,
      plannedDate: data.plannedDate ?? existing.plannedDate,
      plannedTime: data.plannedTime ?? existing.plannedTime,
      zoneIds: data.zoneIds ?? existing.zoneIds,
      status: data.status ?? existing.status,
      excludeFollowUpId: id,
    };

    await this.reservationValidator.validate(merged);

    return this.followUpRepository.update(id, data);
  }
}
