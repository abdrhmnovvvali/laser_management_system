import { FraudReportItem } from '../../domain/entities/fraud-report-item.entity';
import { FraudReportItemResponseDto } from '../dto/fraud-report-item-response.dto';

export class FraudReportMapper {
  static toResponseDto(item: FraudReportItem): FraudReportItemResponseDto {
    const dto = new FraudReportItemResponseDto();
    dto.procedureId = item.procedureId;
    dto.customerId = item.customerId;
    dto.deviceId = item.deviceId;
    dto.branchId = item.branchId;
    dto.declaredShotCount = item.declaredShotCount;
    dto.actualShotCount = item.actualShotCount;
    dto.difference = item.difference;
    dto.date = item.date;
    return dto;
  }

  static toResponseDtoList(
    items: FraudReportItem[],
  ): FraudReportItemResponseDto[] {
    return items.map((item) => this.toResponseDto(item));
  }
}
