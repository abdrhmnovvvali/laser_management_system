import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationException,
  EntityNotFoundException,
} from '../../../../shared/kernel/domain.exception';
import { Role } from '../../../../shared/guards/roles.enum';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class DeleteStaffUserUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(staffId: string, currentUserId: string): Promise<void> {
    if (staffId === currentUserId) {
      throw new BusinessRuleViolationException('Öz hesabınızı silə bilməzsiniz');
    }

    const staff = await this.authRepository.findStaffUserById(staffId);
    if (!staff) {
      throw new EntityNotFoundException('StaffUser', staffId);
    }

    if (staff.role === Role.ADMIN) {
      const adminCount = await this.authRepository.countStaffByRole(Role.ADMIN);
      if (adminCount <= 1) {
        throw new BusinessRuleViolationException('Son admin silinə bilməz');
      }
    }

    await this.authRepository.deleteStaffUser(staffId);
  }
}
