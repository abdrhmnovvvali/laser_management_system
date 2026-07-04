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

  @ApiProperty()
  birthDate: Date;
}
