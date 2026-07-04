import { AuthSession } from '../../domain/entities/auth-session.entity';
import { StaffUser } from '../../domain/entities/staff-user.entity';
import { CurrentUserResponseDto } from '../dto/current-user-response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { StaffUserResponseDto } from '../dto/staff-user-response.dto';

export class AuthMapper {
  static toLoginResponseDto(session: AuthSession): LoginResponseDto {
    const dto = new LoginResponseDto();
    dto.accessToken = session.accessToken;
    dto.refreshToken = session.refreshToken;
    dto.expiresIn = session.expiresIn;
    dto.role = session.role;
    dto.branchId = session.branchId;
    return dto;
  }

  static toCurrentUserResponseDto(session: {
    id: string;
    email?: string;
    role: AuthSession['role'];
    branchId: string | null;
  }): CurrentUserResponseDto {
    const dto = new CurrentUserResponseDto();
    dto.id = session.id;
    dto.email = session.email;
    dto.role = session.role;
    dto.branchId = session.branchId;
    return dto;
  }

  static toStaffUserResponseDto(staffUser: StaffUser): StaffUserResponseDto {
    const dto = new StaffUserResponseDto();
    dto.id = staffUser.id;
    dto.email = staffUser.email;
    dto.fullName = staffUser.fullName;
    dto.role = staffUser.role;
    dto.branchId = staffUser.branchId;
    return dto;
  }
}
