import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { EVENT_PUBLISHER } from '../../../../shared/events/event-publisher.interface';
import type { IEventPublisher } from '../../../../shared/events/event-publisher.interface';
import { CampaignFacade } from '../../../campaigns/application/campaign.facade';
import { CustomerFacade } from '../../../customers/application/customer.facade';
import { DeviceFacade } from '../../../devices/application/device.facade';
import { PackageFacade } from '../../../packages/application/package.facade';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { Procedure } from '../../domain/entities/procedure.entity';
import { ProcedureCompletedEvent } from '../../domain/events/procedure-completed.event';
import { PROCEDURE_REPOSITORY } from '../../domain/repositories/procedure.repository.interface';
import type { IProcedureRepository } from '../../domain/repositories/procedure.repository.interface';
import { calculateCampaignDiscount } from '../../domain/services/campaign-discount.calculator';
import {
  LoyaltyRewardCalculator,
  type ZonePrice,
} from '../../domain/services/loyalty-reward.calculator';

export interface CreateProcedureInput {
  customerId: string;
  deviceId: string;
  packageId?: string;
  campaignId?: string;
  zoneIds?: string[];
  date?: Date;
  declaredShotCount: number;
  actualShotCount: number;
}

interface ResolvedPricing {
  price: number;
  zoneIds: string[];
  zones: ZonePrice[];
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
    private readonly campaignFacade: CampaignFacade,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: CreateProcedureInput): Promise<Procedure> {
    const customer = await this.customerFacade.getById(input.customerId);
    await this.deviceFacade.getById(input.deviceId);

    const completedVisitCount = customer.visitCount;
    const procedureDate = input.date ?? new Date();
    const pricing = await this.resolvePriceAndZones(input);

    const campaignDiscount = input.campaignId
      ? await this.resolveCampaignDiscount(
          input.campaignId,
          pricing.price,
          pricing.zoneIds,
          procedureDate,
        )
      : 0;

    const priceAfterCampaign = Math.max(0, pricing.price - campaignDiscount);

    const loyalty = LoyaltyRewardCalculator.apply(
      priceAfterCampaign,
      pricing.zones,
      completedVisitCount,
      {
        visitsBeforeFreeZone: this.configService.get<number>(
          'loyalty.visitsBeforeFreeZone',
        )!,
      },
    );

    const procedure = await this.procedureRepository.create({
      customerId: input.customerId,
      deviceId: input.deviceId,
      packageId: input.packageId ?? null,
      campaignId: input.campaignId ?? null,
      date: procedureDate,
      declaredShotCount: input.declaredShotCount,
      actualShotCount: input.actualShotCount,
      price: loyalty.finalPrice,
      zoneIds: pricing.zoneIds,
      freeZoneId: loyalty.freeZoneId,
      discountAmount: campaignDiscount + loyalty.discountAmount,
      visitNumber: loyalty.visitNumber,
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

  private async resolveCampaignDiscount(
    campaignId: string,
    basePrice: number,
    procedureZoneIds: string[],
    procedureDate: Date,
  ): Promise<number> {
    const campaign = await this.campaignFacade.getById(campaignId);
    const procedureDay = procedureDate.toISOString().slice(0, 10);
    const startDay = campaign.startDate.toISOString().slice(0, 10);
    const endDay = campaign.endDate.toISOString().slice(0, 10);

    if (procedureDay < startDay || procedureDay > endDay) {
      throw new BusinessRuleViolationException(
        'Seçilən kampaniya prosedur tarixində aktiv deyil',
      );
    }

    if (campaign.zoneIds.length > 0) {
      const overlaps = procedureZoneIds.some((zoneId) =>
        campaign.zoneIds.includes(zoneId),
      );
      if (!overlaps) {
        throw new BusinessRuleViolationException(
          'Seçilən kampaniya bu prosedurun nahiyələrinə şamil olunmur',
        );
      }
    }

    return calculateCampaignDiscount(basePrice, campaign);
  }

  private async resolvePriceAndZones(
    input: CreateProcedureInput,
  ): Promise<ResolvedPricing> {
    if (input.packageId) {
      const pkg = await this.packageFacade.getById(input.packageId);
      const zoneIds =
        input.zoneIds && input.zoneIds.length > 0 ? input.zoneIds : pkg.zoneIds;
      const zones = await this.loadZonePrices(zoneIds);
      return { price: pkg.price, zoneIds, zones };
    }

    if (!input.zoneIds || input.zoneIds.length === 0) {
      throw new BusinessRuleViolationException(
        'packageId verilməyibsə, ən azı bir zoneId göstərilməlidir',
      );
    }

    const zones = await this.loadZonePrices(input.zoneIds);
    if (zones.length !== input.zoneIds.length) {
      throw new BusinessRuleViolationException(
        'Seçilən nahiyələrdən biri və ya bir neçəsi tapılmadı',
      );
    }

    const price = zones.reduce((sum, zone) => sum + zone.price, 0);
    return { price, zoneIds: input.zoneIds, zones };
  }

  private async loadZonePrices(zoneIds: string[]): Promise<ZonePrice[]> {
    if (zoneIds.length === 0) {
      return [];
    }

    const zones = await this.zoneFacade.getByIds(zoneIds);
    return zones.map((zone) => ({ id: zone.id, price: zone.price }));
  }
}
