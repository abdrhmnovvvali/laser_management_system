import {
  BranchNameLookup,
  lookupBranchName,
} from '../../../../shared/branch/branch-name.util';
import { AuthSession } from '../../domain/entities/auth-session.entity';
import { StaffUser } from '../../domain/entities/staff-user.entity';
import { CurrentUserResponseDto } from '../dto/current-user-response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { StaffUserResponseDto } from '../dto/staff-user-response.dto';

export class AuthMapper {
  static toLoginResponseDto(
    session: AuthSession,
    branchNames: BranchNameLookup = new Map(),
  ): LoginResponseDto {
    const dto = new LoginResponseDto();
    dto.accessToken = session.accessToken;
    dto.refreshToken = session.refreshToken;
    dto.expiresIn = session.expiresIn;
    dto.role = session.role;
    dto.branchId = session.branchId;
    dto.branchName = lookupBranchName(session.branchId, branchNames);
    return dto;
  }

  static toCurrentUserResponseDto(
    session: {
      id: string;
      email?: string;
      role: AuthSession['role'];
      branchId: string | null;
    },
    branchNames: BranchNameLookup = new Map(),
  ): CurrentUserResponseDto {
    const dto = new CurrentUserResponseDto();
    dto.id = session.id;
    dto.email = session.email;
    dto.role = session.role;
    dto.branchId = session.branchId;
    dto.branchName = lookupBranchName(session.branchId, branchNames);
    return dto;
  }

  static toStaffUserResponseDto(
    staffUser: StaffUser,
    branchNames: BranchNameLookup = new Map(),
  ): StaffUserResponseDto {
    const dto = new StaffUserResponseDto();
    dto.id = staffUser.id;
    dto.email = staffUser.email;
    dto.fullName = staffUser.fullName;
    dto.role = staffUser.role;
    dto.branchId = staffUser.branchId;
    dto.branchName = lookupBranchName(staffUser.branchId, branchNames);
    return dto;
  }
}
