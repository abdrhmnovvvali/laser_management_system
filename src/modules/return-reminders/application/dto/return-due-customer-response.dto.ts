import { ApiProperty } from '@nestjs/swagger';

export class ReturnDueCustomerResponseDto {
  @ApiProperty()
  customerId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ nullable: true })
  phone: string | null;

  @ApiProperty()
  branchId: string;

  @ApiProperty({ nullable: true, description: 'Filialın adı' })
  branchName: string | null;

  @ApiProperty({ description: 'Sonuncu prosedurun tarixi' })
  lastVisitAt: Date;

  @ApiProperty({ description: 'Son vizitdən keçən gün sayı' })
  daysSinceLastVisit: number;

  @ApiProperty({ description: 'Müştərinin cəmi vizit sayı' })
  visitCount: number;
}
