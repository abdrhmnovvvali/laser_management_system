import { ApiProperty } from '@nestjs/swagger';
import { ImportRowErrorResponseDto } from './import-row-error-response.dto';

export class ImportResultResponseDto {
  @ApiProperty()
  totalRows: number;

  @ApiProperty()
  successCount: number;

  @ApiProperty()
  failedCount: number;

  @ApiProperty({ type: [ImportRowErrorResponseDto] })
  errors: ImportRowErrorResponseDto[];
}
