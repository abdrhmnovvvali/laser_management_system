import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { Gender } from '../../domain/entities/gender.enum';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Aygün' })
  @IsString()
  @MinLength(2)
  firstName!: string;

  @ApiProperty({ example: 'Məmmədova' })
  @IsString()
  @MinLength(2)
  lastName!: string;

  @ApiProperty({ example: '+994501234567', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: '1995-05-20', required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ example: 0, required: false, description: 'İlkin vizit sayı' })
  @IsOptional()
  @IsInt()
  @Min(0)
  visitCount?: number;
}
