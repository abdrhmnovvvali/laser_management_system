import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Role } from '../../../../shared/guards/roles.enum';

export class CreateStaffUserDto {
  @ApiProperty({ example: 'staff@lazer.az' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Aygün Məmmədova', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ enum: Role, example: Role.BRANCH_STAFF })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    example: 'a1b2c3d4-...',
    nullable: true,
    description: 'Admin rolunda null ola bilər, filial işçisi üçün mütləqdir',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string | null;
}
