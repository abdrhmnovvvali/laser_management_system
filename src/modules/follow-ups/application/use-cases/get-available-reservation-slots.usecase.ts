import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateReservationSlotTimes } from '../../domain/reservation-slot.util';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up.repository.interface';
import {
  AvailableReservationSlotsResponseDto,
  ReservationSlotDto,
} from '../dto/available-reservation-slots.dto';

export interface GetAvailableReservationSlotsInput {
  deviceId: string;
  date: Date;
  excludeFollowUpId?: string;
}

@Injectable()
export class GetAvailableReservationSlotsUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    input: GetAvailableReservationSlotsInput,
  ): Promise<AvailableReservationSlotsResponseDto> {
    const slotTimes = generateReservationSlotTimes({
      slotStart: this.configService.get<string>('reservation.slotStart')!,
      slotEnd: this.configService.get<string>('reservation.slotEnd')!,
      slotMinutes: this.configService.get<number>('reservation.slotMinutes')!,
    });

    const bookedTimes = await this.followUpRepository.findBookedTimesForDay({
      deviceId: input.deviceId,
      plannedDate: input.date,
    });

    let bookedSet = new Set(bookedTimes);
    if (input.excludeFollowUpId) {
      const existing = await this.followUpRepository.findById(
        input.excludeFollowUpId,
      );
      if (
        existing &&
        existing.deviceId === input.deviceId &&
        existing.plannedDate.toISOString().slice(0, 10) ===
          input.date.toISOString().slice(0, 10)
      ) {
        bookedSet = new Set(
          bookedTimes.filter((time) => time !== existing.plannedTime),
        );
      }
    }

    const slots: ReservationSlotDto[] = slotTimes.map((time) => ({
      time,
      available: !bookedSet.has(time),
    }));

    return { slots };
  }
}
