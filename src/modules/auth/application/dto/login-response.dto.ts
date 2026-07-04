import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../shared/guards/roles.enum';

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ nullable: true })
  branchId: string | null;
}
