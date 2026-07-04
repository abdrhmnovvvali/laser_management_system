import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { EVENT_PUBLISHER } from '../../../../shared/events/event-publisher.interface';
import type { IEventPublisher } from '../../../../shared/events/event-publisher.interface';
import { CustomerFacade } from '../../../customers/application/customer.facade';
import { DeviceFacade } from '../../../devices/application/device.facade';
import { PackageFacade } from '../../../packages/application/package.facade';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { Procedure } from '../../domain/entities/procedure.entity';
import { ProcedureCompletedEvent } from '../../domain/events/procedure-completed.event';
import { PROCEDURE_REPOSITORY } from '../../domain/repositories/procedure.repository.interface';
import type { IProcedureRepository } from '../../domain/repositories/procedure.repository.interface';

export interface CreateProcedureInput {
  customerId: string;
  deviceId: string;
  packageId?: string;
  zoneIds?: string[];
  date?: Date;
  declaredShotCount: number;
  actualShotCount: number;
}

@Injectable()
export class CreateProcedureUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY)
    private readonly procedureRepository: IProcedureRepository,
    private readonly customerFacade: CustomerFacade,
    private readonly deviceFacade: DeviceFacade,
    private readonly packageFacade: PackageFacade,
    private readonly zoneFacade: ZoneFacade,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(input: CreateProcedureInput): Promise<Procedure> {
    await this.customerFacade.getById(input.customerId);
    await this.deviceFacade.getById(input.deviceId);

    const { price, zoneIds } = await this.resolvePriceAndZones(input);

    const procedure = await this.procedureRepository.create({
      customerId: input.customerId,
      deviceId: input.deviceId,
      packageId: input.packageId ?? null,
      date: input.date ?? new Date(),
      declaredShotCount: input.declaredShotCount,
      actualShotCount: input.actualShotCount,
      price,
      zoneIds,
    });

    await this.deviceFacade.incrementShotCounter(
      input.deviceId,
      input.actualShotCount,
    );

    this.eventPublisher.publish(
      new ProcedureCompletedEvent(
        procedure.id,
        procedure.customerId,
        procedure.deviceId,
        procedure.declaredShotCount,
        procedure.actualShotCount,
        procedure.date,
      ),
    );

    return procedure;
  }

  private async resolvePriceAndZones(
    input: CreateProcedureInput,
  ): Promise<{ price: number; zoneIds: string[] }> {
    if (input.packageId) {
      const pkg = await this.packageFacade.getById(input.packageId);
      const zoneIds =
        input.zoneIds && input.zoneIds.length > 0 ? input.zoneIds : pkg.zoneIds;
      return { price: pkg.price, zoneIds };
    }

    if (!input.zoneIds || input.zoneIds.length === 0) {
      throw new BusinessRuleViolationException(
        'packageId verilməyibsə, ən azı bir zoneId göstərilməlidir',
      );
    }

    const zones = await this.zoneFacade.getByIds(input.zoneIds);
    if (zones.length !== input.zoneIds.length) {
      throw new BusinessRuleViolationException(
        'Seçilən nahiyələrdən biri və ya bir neçəsi tapılmadı',
      );
    }

    const price = zones.reduce((sum, zone) => sum + zone.price, 0);
    return { price, zoneIds: input.zoneIds };
  }
}
