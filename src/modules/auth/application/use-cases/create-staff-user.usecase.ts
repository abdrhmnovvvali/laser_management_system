import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { Role } from '../../../../shared/guards/roles.enum';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import type {
  CreateStaffUserInput,
  IAuthRepository,
} from '../../domain/repositories/auth.repository.interface';
import { StaffUser } from '../../domain/entities/staff-user.entity';

@Injectable()
export class CreateStaffUserUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(input: CreateStaffUserInput): Promise<StaffUser> {
    if (input.role === Role.BRANCH_STAFF && !input.branchId) {
      throw new BusinessRuleViolationException(
        'Filial işçisi üçün branchId mütləqdir',
      );
    }

    return this.authRepository.createStaffUser(input);
  }
}
