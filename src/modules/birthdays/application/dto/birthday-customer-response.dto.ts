import { ApiProperty } from '@nestjs/swagger';

export class BirthdayCustomerResponseDto {
  @ApiProperty()
  customerId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty({ nullable: true, description: 'Filialın adı' })
  branchName: string | null;

  @ApiProperty()
  birthDate: Date;
}
