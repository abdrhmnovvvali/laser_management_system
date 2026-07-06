import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../shared/guards/roles.enum';

export class StaffUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  fullName?: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ nullable: true })
  branchId: string | null;

  @ApiProperty({ nullable: true, description: 'Filialın adı' })
  branchName: string | null;
}
