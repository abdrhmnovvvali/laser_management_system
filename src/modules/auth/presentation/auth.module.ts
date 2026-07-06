import { Module } from '@nestjs/common';
import { BranchesModule } from '../../branches/presentation/branches.module';
import { AUTH_REPOSITORY } from '../domain/repositories/auth.repository.interface';
import { SupabaseAuthRepository } from '../infrastructure/persistence/supabase/supabase-auth.repository';
import { CreateStaffUserUseCase } from '../application/use-cases/create-staff-user.usecase';
import { DeleteStaffUserUseCase } from '../application/use-cases/delete-staff-user.usecase';
import { LoginUseCase } from '../application/use-cases/login.usecase';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [BranchesModule],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    CreateStaffUserUseCase,
    DeleteStaffUserUseCase,
    { provide: AUTH_REPOSITORY, useClass: SupabaseAuthRepository },
  ],
})
export class AuthModule {}
