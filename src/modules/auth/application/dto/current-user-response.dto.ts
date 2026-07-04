import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../shared/guards/roles.enum';

export class CurrentUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ nullable: true })
  branchId: string | null;
}
