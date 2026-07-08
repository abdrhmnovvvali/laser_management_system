import { Injectable } from '@nestjs/common';
import { BranchFacade } from '../../modules/branches/application/branch.facade';
import { CustomerFacade } from '../../modules/customers/application/customer.facade';
import { DeviceFacade } from '../../modules/devices/application/device.facade';
import { PackageFacade } from '../../modules/packages/application/package.facade';
import { ZoneFacade } from '../../modules/zones/application/zone.facade';
import {
  EMPTY_RELATION_LOOKUPS,
  RelationIds,
  RelationLookups,
} from './relation-lookups.interface';

@Injectable()
export class RelationLookupService {
  constructor(
    private readonly branchFacade: BranchFacade,
    private readonly zoneFacade: ZoneFacade,
    private readonly customerFacade: CustomerFacade,
    private readonly deviceFacade: DeviceFacade,
    private readonly packageFacade: PackageFacade,
  ) {}

  async load(ids: RelationIds): Promise<RelationLookups> {
    const hasAny =
      ids.branchIds ||
      ids.zoneIds ||
      ids.customerIds ||
      ids.deviceIds ||
      ids.packageIds;

    if (!hasAny) {
      return EMPTY_RELATION_LOOKUPS;
    }

    const [branches, zones, customers, devices, packages] = await Promise.all([
      this.branchFacade.resolveNames(ids.branchIds ?? []),
      this.zoneFacade.resolveNames(ids.zoneIds ?? []),
      this.customerFacade.resolveNames(ids.customerIds ?? []),
      this.deviceFacade.resolveNames(ids.deviceIds ?? []),
      this.packageFacade.resolveNames(ids.packageIds ?? []),
    ]);

    return { branches, zones, customers, devices, packages };
  }
}
