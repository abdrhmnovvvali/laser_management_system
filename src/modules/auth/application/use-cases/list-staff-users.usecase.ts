import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { StaffUser } from '../../domain/entities/staff-user.entity';

@Injectable()
export class ListStaffUsersUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(): Promise<StaffUser[]> {
    return this.authRepository.findAllStaffUsers();
  }
}
