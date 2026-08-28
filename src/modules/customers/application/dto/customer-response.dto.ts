import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../domain/entities/gender.enum';

export class CustomerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ nullable: true })
  phone: string | null;

  @ApiProperty({ nullable: true })
  birthDate: Date | null;

  @ApiProperty({ enum: Gender, nullable: true })
  gender: Gender | null;

  @ApiProperty()
  branchId: string;

  @ApiProperty({ nullable: true, description: 'Filialın adı' })
  branchName: string | null;

  @ApiProperty()
  registeredAt: Date;

  @ApiProperty({ default: 0, description: 'Müştərinin cəmi vizit sayı' })
  visitCount: number;
}
