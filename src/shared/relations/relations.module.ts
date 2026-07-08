import { Global, Module } from '@nestjs/common';
import { BranchesModule } from '../../modules/branches/presentation/branches.module';
import { CustomersModule } from '../../modules/customers/presentation/customers.module';
import { DevicesModule } from '../../modules/devices/presentation/devices.module';
import { PackagesModule } from '../../modules/packages/presentation/packages.module';
import { ZonesModule } from '../../modules/zones/presentation/zones.module';
import { RelationLookupService } from './relation-lookup.service';

@Global()
@Module({
  imports: [
    BranchesModule,
    ZonesModule,
    CustomersModule,
    DevicesModule,
    PackagesModule,
  ],
  providers: [RelationLookupService],
  exports: [RelationLookupService],
})
export class RelationsModule {}
