import { Module } from '@nestjs/common';
import { ZonesModule } from '../../zones/presentation/zones.module';
import { PACKAGE_REPOSITORY } from '../domain/repositories/package.repository.interface';
import { SupabasePackageRepository } from '../infrastructure/persistence/supabase/supabase-package.repository';
import { PackageFacade } from '../application/package.facade';
import { CreatePackageUseCase } from '../application/use-cases/create-package.usecase';
import { DeletePackageUseCase } from '../application/use-cases/delete-package.usecase';
import { GetPackageUseCase } from '../application/use-cases/get-package.usecase';
import { ListPackagesUseCase } from '../application/use-cases/list-packages.usecase';
import { UpdatePackageUseCase } from '../application/use-cases/update-package.usecase';
import { PackagesController } from './controllers/packages.controller';

@Module({
  imports: [ZonesModule],
  controllers: [PackagesController],
  providers: [
    ListPackagesUseCase,
    GetPackageUseCase,
    CreatePackageUseCase,
    UpdatePackageUseCase,
    DeletePackageUseCase,
    PackageFacade,
    { provide: PACKAGE_REPOSITORY, useClass: SupabasePackageRepository },
  ],
  exports: [PackageFacade],
})
export class PackagesModule {}
