import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { CustomerFacade } from '../../../customers/application/customer.facade';
import { DeviceFacade } from '../../../devices/application/device.facade';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';
import { isValidPlannedTime } from '../../domain/reservation-slot.util';
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

  async validate(input: ReservationInput): Promise<void> {
    if (!isValidPlannedTime(input.plannedTime)) {
      throw new BusinessRuleViolationException(
        'Saat formatı düzgün deyil (HH:mm)',
      );
    }

    this.assertTimeWithinSchedule(input.plannedTime);

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

    const effectiveStatus = input.status ?? FollowUpStatus.PENDING;
    if (effectiveStatus !== FollowUpStatus.PENDING) {
      return;
    }

    const conflict = await this.followUpRepository.findPendingSlotConflict({
      deviceId: input.deviceId,
      plannedDate: input.plannedDate,
      plannedTime: input.plannedTime,
      excludeFollowUpId: input.excludeFollowUpId,
    });

    if (conflict) {
      throw new BusinessRuleViolationException(
        'Bu cihaz üçün seçilmiş tarix və saat artıq rezerv edilib',
      );
    }
  }

  private assertTimeWithinSchedule(plannedTime: string): void {
    const slotStart = this.configService.get<string>('reservation.slotStart')!;
    const slotEnd = this.configService.get<string>('reservation.slotEnd')!;
    const slotMinutes = this.configService.get<number>('reservation.slotMinutes')!;

    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const planned = toMinutes(plannedTime);
    const start = toMinutes(slotStart);
    const end = toMinutes(slotEnd);

    if (planned < start || planned >= end) {
      throw new BusinessRuleViolationException(
        `Rezervasiya saatı ${slotStart}–${slotEnd} aralığında olmalıdır`,
      );
    }

    if ((planned - start) % slotMinutes !== 0) {
      throw new BusinessRuleViolationException(
        `Rezervasiya saatı ${slotMinutes} dəqiqəlik slotlara uyğun olmalıdır`,
      );
    }
  }
}
