import { ApiProperty } from '@nestjs/swagger';

export class ImportRowErrorResponseDto {
  @ApiProperty()
  row: number;

  @ApiProperty()
  message: string;
}
