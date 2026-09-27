import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationException,
  EntityNotFoundException,
} from '../../../../shared/kernel/domain.exception';
import { Role } from '../../../../shared/guards/roles.enum';
import { StaffUser } from '../../domain/entities/staff-user.entity';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class SetStaffUserActiveUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    staffId: string,
    isActive: boolean,
    currentUserId: string,
  ): Promise<StaffUser> {
    const staff = await this.authRepository.findStaffUserById(staffId);
    if (!staff) {
      throw new EntityNotFoundException('StaffUser', staffId);
    }

    if (!isActive) {
      if (staffId === currentUserId) {
        throw new BusinessRuleViolationException(
          'Öz hesabınızı deaktiv edə bilməzsiniz',
        );
      }

      if (staff.role === Role.ADMIN && staff.isActive) {
        const activeAdmins = await this.authRepository.countActiveStaffByRole(
          Role.ADMIN,
        );
        if (activeAdmins <= 1) {
          throw new BusinessRuleViolationException(
            'Son aktiv admin deaktiv edilə bilməz',
          );
        }
      }
    }

    return this.authRepository.setStaffUserActive(staffId, isActive);
  }
}
