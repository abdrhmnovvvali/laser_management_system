import { ApiProperty } from '@nestjs/swagger';

export class BranchResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  address: string | null;

  @ApiProperty()
  createdAt: Date;
}
