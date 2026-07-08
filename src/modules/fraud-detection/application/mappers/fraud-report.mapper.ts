import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
import { FraudReportItem } from '../../domain/entities/fraud-report-item.entity';
import { FraudReportItemResponseDto } from '../dto/fraud-report-item-response.dto';

export class FraudReportMapper {
  static toResponseDto(
    item: FraudReportItem,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): FraudReportItemResponseDto {
    const dto = new FraudReportItemResponseDto();
    dto.procedureId = item.procedureId;
    dto.customerId = item.customerId;
    dto.customerName = lookupName(lookups.customers, item.customerId);
    dto.deviceId = item.deviceId;
    dto.deviceName = lookupName(lookups.devices, item.deviceId);
    dto.branchId = item.branchId;
    dto.branchName = lookupName(lookups.branches, item.branchId);
    dto.declaredShotCount = item.declaredShotCount;
    dto.actualShotCount = item.actualShotCount;
    dto.difference = item.difference;
    dto.date = item.date;
    return dto;
  }

  static toResponseDtoList(
    items: FraudReportItem[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): FraudReportItemResponseDto[] {
    return items.map((item) => this.toResponseDto(item, lookups));
  }
}
