import { Module } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../domain/repositories/auth.repository.interface';
import { SupabaseAuthRepository } from '../infrastructure/persistence/supabase/supabase-auth.repository';
import { CreateStaffUserUseCase } from '../application/use-cases/create-staff-user.usecase';
import { LoginUseCase } from '../application/use-cases/login.usecase';
import { AuthController } from './controllers/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    CreateStaffUserUseCase,
    { provide: AUTH_REPOSITORY, useClass: SupabaseAuthRepository },
  ],
})
export class AuthModule {}
