import { Module } from '@nestjs/common';
import { BranchesModule } from '../../branches/presentation/branches.module';
import { AUTH_REPOSITORY } from '../domain/repositories/auth.repository.interface';
import { PrismaAuthRepository } from '../infrastructure/persistence/prisma/prisma-auth.repository';
import { CreateStaffUserUseCase } from '../application/use-cases/create-staff-user.usecase';
import { DeleteStaffUserUseCase } from '../application/use-cases/delete-staff-user.usecase';
import { ListStaffUsersUseCase } from '../application/use-cases/list-staff-users.usecase';
import { LoginUseCase } from '../application/use-cases/login.usecase';
import { RefreshSessionUseCase } from '../application/use-cases/refresh-session.usecase';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [BranchesModule],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RefreshSessionUseCase,
    CreateStaffUserUseCase,
    ListStaffUsersUseCase,
    DeleteStaffUserUseCase,
    { provide: AUTH_REPOSITORY, useClass: PrismaAuthRepository },
  ],
})
export class AuthModule {}
