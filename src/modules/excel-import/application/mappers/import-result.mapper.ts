import { ImportResult } from '../../domain/entities/import-result.entity';
import { ImportResultResponseDto } from '../dto/import-result-response.dto';

export class ImportResultMapper {
  static toResponseDto(result: ImportResult): ImportResultResponseDto {
    const dto = new ImportResultResponseDto();
    dto.totalRows = result.totalRows;
    dto.successCount = result.successCount;
    dto.failedCount = result.failedCount;
    dto.errors = result.errors.map((error) => ({
      row: error.row,
      message: error.message,
    }));
    return dto;
  }
}
