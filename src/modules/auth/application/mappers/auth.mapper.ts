import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
import { AuthSession } from '../../domain/entities/auth-session.entity';
import { StaffUser } from '../../domain/entities/staff-user.entity';
import { CurrentUserResponseDto } from '../dto/current-user-response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { StaffUserResponseDto } from '../dto/staff-user-response.dto';

export class AuthMapper {
  static toLoginResponseDto(
    session: AuthSession,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): LoginResponseDto {
    const dto = new LoginResponseDto();
    dto.accessToken = session.accessToken;
    dto.refreshToken = session.refreshToken;
    dto.expiresIn = session.expiresIn;
    dto.role = session.role;
    dto.branchId = session.branchId;
    dto.branchName = lookupName(lookups.branches, session.branchId);
    return dto;
  }

  static toCurrentUserResponseDto(
    session: {
      id: string;
      email?: string;
      role: AuthSession['role'];
      branchId: string | null;
    },
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): CurrentUserResponseDto {
    const dto = new CurrentUserResponseDto();
    dto.id = session.id;
    dto.email = session.email;
    dto.role = session.role;
    dto.branchId = session.branchId;
    dto.branchName = lookupName(lookups.branches, session.branchId);
    return dto;
  }

  static toStaffUserResponseDto(
    staffUser: StaffUser,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): StaffUserResponseDto {
    const dto = new StaffUserResponseDto();
    dto.id = staffUser.id;
    dto.email = staffUser.email;
    dto.fullName = staffUser.fullName;
    dto.role = staffUser.role;
    dto.branchId = staffUser.branchId;
    dto.branchName = lookupName(lookups.branches, staffUser.branchId);
    return dto;
  }

  static toStaffUserResponseDtoList(
    staffUsers: StaffUser[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): StaffUserResponseDto[] {
    return staffUsers.map((staffUser) =>
      this.toStaffUserResponseDto(staffUser, lookups),
    );
  }
}
