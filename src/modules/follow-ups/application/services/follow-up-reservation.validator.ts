import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { CustomerFacade } from '../../../customers/application/customer.facade';
import { DeviceFacade } from '../../../devices/application/device.facade';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { sumZoneNorms } from '../../../zones/domain/services/zone-norms.calculator';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';
import {
  findOverlappingBooking,
  formatMinutesToTime,
  isValidPlannedTime,
  parseTimeToMinutes,
  resolveReservationDuration,
  toBookedInterval,
} from '../../domain/reservation-slot.util';
import type { ReservationDuration } from '../../domain/reservation-slot.util';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up.repository.interface';

export interface ReservationInput {
  customerId: string;
  deviceId: string;
  plannedDate: Date;
  plannedTime: string;
  zoneIds: string[];
  status?: FollowUpStatus;
  excludeFollowUpId?: string;
  /** Verilibsə, nahiyələrdən hesablanmır (məs. redaktədə nahiyələr dəyişməyibsə). */
  duration?: ReservationDuration;
}

@Injectable()
export class FollowUpReservationValidator {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
    private readonly customerFacade: CustomerFacade,
    private readonly deviceFacade: DeviceFacade,
    private readonly zoneFacade: ZoneFacade,
    private readonly configService: ConfigService,
  ) {}

  /** Rezervasiyanı yoxlayır və onun təxmini müddətini qaytarır. */
  async validate(input: ReservationInput): Promise<ReservationDuration> {
    if (!isValidPlannedTime(input.plannedTime)) {
      throw new BusinessRuleViolationException(
        'Saat formatı düzgün deyil (HH:mm)',
      );
    }

    const customer = await this.customerFacade.getById(input.customerId);
    const device = await this.deviceFacade.getById(input.deviceId);

    if (device.branchId !== customer.branchId) {
      throw new BusinessRuleViolationException(
        'Seçilən cihaz müştərinin filialına aid deyil',
      );
    }

    if (!input.zoneIds.length) {
      throw new BusinessRuleViolationException(
        'Ən azı bir nahiyə seçilməlidir',
      );
    }

    const zones = await this.zoneFacade.getByIds(input.zoneIds);
    if (zones.length !== input.zoneIds.length) {
      throw new BusinessRuleViolationException(
        'Seçilən nahiyələrdən biri və ya bir neçəsi tapılmadı',
      );
    }

    const invalidZone = zones.find((zone) => zone.deviceId !== input.deviceId);
    if (invalidZone) {
      throw new BusinessRuleViolationException(
        'Seçilən nahiyələr seçilmiş cihaza aid olmalıdır',
      );
    }

    const duration =
      input.duration ??
      resolveReservationDuration(
        sumZoneNorms(zones.map((zone) => zone.norms)),
        this.slotMinutes,
      );

    const effectiveStatus = input.status ?? FollowUpStatus.PENDING;
    if (effectiveStatus !== FollowUpStatus.PENDING) {
      return duration;
    }

    this.assertTimeWithinSchedule(input.plannedTime, duration.minMinutes);

    const bookings = await this.followUpRepository.findPendingForDay({
      deviceId: input.deviceId,
      plannedDate: input.plannedDate,
      excludeFollowUpId: input.excludeFollowUpId,
    });

    const conflict = findOverlappingBooking(
      bookings.map(toBookedInterval),
      parseTimeToMinutes(input.plannedTime),
      duration.minMinutes,
    );

    if (conflict) {
      throw new BusinessRuleViolationException(
        `Bu cihaz ${formatMinutesToTime(conflict.start)}–${formatMinutesToTime(conflict.minEnd)} ` +
          `aralığında məşğuldur (seçilən seans ${duration.minMinutes} dəq çəkir)`,
      );
    }

    return duration;
  }

  private get slotMinutes(): number {
    return this.configService.get<number>('reservation.slotMinutes')!;
  }

  private assertTimeWithinSchedule(
    plannedTime: string,
    durationMinutes: number,
  ): void {
    const slotStart = this.configService.get<string>('reservation.slotStart')!;
    const slotEnd = this.configService.get<string>('reservation.slotEnd')!;

    const planned = parseTimeToMinutes(plannedTime);
    const start = parseTimeToMinutes(slotStart);
    const end = parseTimeToMinutes(slotEnd);

    if (planned < start || planned >= end) {
      throw new BusinessRuleViolationException(
        `Rezervasiya saatı ${slotStart}–${slotEnd} aralığında olmalıdır`,
      );
    }

    if (planned + durationMinutes > end) {
      throw new BusinessRuleViolationException(
        `Seans ${durationMinutes} dəq çəkir və ${slotEnd}-dən əvvəl bitməlidir`,
      );
    }
  }
}
