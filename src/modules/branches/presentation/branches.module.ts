import { Module } from '@nestjs/common';
import { BRANCH_REPOSITORY } from '../domain/repositories/branch.repository.interface';
import { SupabaseBranchRepository } from '../infrastructure/persistence/supabase/supabase-branch.repository';
import { BranchFacade } from '../application/branch.facade';
import { CreateBranchUseCase } from '../application/use-cases/create-branch.usecase';
import { DeleteBranchUseCase } from '../application/use-cases/delete-branch.usecase';
import { GetBranchUseCase } from '../application/use-cases/get-branch.usecase';
import { ListBranchesUseCase } from '../application/use-cases/list-branches.usecase';
import { UpdateBranchUseCase } from '../application/use-cases/update-branch.usecase';
import { BranchesController } from './controllers/branches.controller';

@Module({
  controllers: [BranchesController],
  providers: [
    ListBranchesUseCase,
    GetBranchUseCase,
    CreateBranchUseCase,
    UpdateBranchUseCase,
    DeleteBranchUseCase,
    BranchFacade,
    { provide: BRANCH_REPOSITORY, useClass: SupabaseBranchRepository },
  ],
  exports: [BranchFacade],
})
export class BranchesModule {}
