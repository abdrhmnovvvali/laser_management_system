import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomerFacade } from '../../../customers/application/customer.facade';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { sumZoneNorms } from '../../../zones/domain/services/zone-norms.calculator';
import {
  buildReservationSlots,
  formatMinutesToTime,
  resolveReservationDuration,
  toBookedInterval,
} from '../../domain/reservation-slot.util';
import { isSameDateOnly } from '../../../../shared/date/date-only.util';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up.repository.interface';
import { AvailableReservationSlotsResponseDto } from '../dto/available-reservation-slots.dto';

export interface GetAvailableReservationSlotsInput {
  deviceId: string;
  date: Date;
  excludeFollowUpId?: string;
  /** Yeni seansın nahiyələri — müddəti hesablamaq üçün. */
  zoneIds?: string[];
}

@Injectable()
export class GetAvailableReservationSlotsUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
    private readonly zoneFacade: ZoneFacade,
    private readonly customerFacade: CustomerFacade,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    input: GetAvailableReservationSlotsInput,
  ): Promise<AvailableReservationSlotsResponseDto> {
    const slotMinutes = this.configService.get<number>('reservation.slotMinutes')!;
    const slotStart = this.configService.get<string>('reservation.slotStart')!;
    const slotEnd = this.configService.get<string>('reservation.slotEnd')!;

    const zones = input.zoneIds?.length
      ? await this.zoneFacade.getByIds(input.zoneIds)
      : [];
    const duration = resolveReservationDuration(
      sumZoneNorms(zones.map((zone) => zone.norms)),
      slotMinutes,
    );

    const followUps = await this.followUpRepository.findPendingForDay({
      deviceId: input.deviceId,
      plannedDate: input.date,
      excludeFollowUpId: input.excludeFollowUpId,
    });
    const bookings = followUps.map(toBookedInterval);
    const customerNames = await this.customerFacade.resolveNames(
      followUps.map((followUp) => followUp.customerId),
    );
    const customerIdByFollowUp = new Map(
      followUps.map((followUp) => [followUp.id, followUp.customerId]),
    );

    // Redaktədə cari rezervasiyanın saatı şəbəkədə olmasa belə siyahıda qalsın.
    const extraTimes: string[] = [];
    if (input.excludeFollowUpId) {
      const existing = await this.followUpRepository.findById(
        input.excludeFollowUpId,
      );
      if (
        existing &&
        existing.deviceId === input.deviceId &&
        isSameDateOnly(existing.plannedDate, input.date)
      ) {
        extraTimes.push(existing.plannedTime);
      }
    }

    const slots = buildReservationSlots({
      slotStart,
      slotEnd,
      slotMinutes,
      bookings,
      durationMinutes: duration.minMinutes,
      extraTimes,
    });

    return {
      workdayStart: slotStart,
      workdayEnd: slotEnd,
      durationMinMinutes: duration.minMinutes,
      durationMaxMinutes: duration.maxMinutes,
      bookings: bookings.map((booking) => ({
        followUpId: booking.followUpId,
        customerName:
          customerNames.get(customerIdByFollowUp.get(booking.followUpId) ?? '') ??
          null,
        start: formatMinutesToTime(booking.start),
        minEnd: formatMinutesToTime(booking.minEnd),
        maxEnd: formatMinutesToTime(booking.maxEnd),
      })),
      slots,
    };
  }
}
