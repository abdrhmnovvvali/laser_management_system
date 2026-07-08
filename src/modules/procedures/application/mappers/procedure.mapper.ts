import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import {
  lookupName,
  toNamedEntities,
} from '../../../../shared/relations/relation-name.util';
import { Procedure } from '../../domain/entities/procedure.entity';
import { ProcedureResponseDto } from '../dto/procedure-response.dto';

export class ProcedureMapper {
  static toResponseDto(
    procedure: Procedure,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): ProcedureResponseDto {
    const dto = new ProcedureResponseDto();
    dto.id = procedure.id;
    dto.customerId = procedure.customerId;
    dto.customerName = lookupName(lookups.customers, procedure.customerId);
    dto.deviceId = procedure.deviceId;
    dto.deviceName = lookupName(lookups.devices, procedure.deviceId);
    dto.packageId = procedure.packageId;
    dto.packageName = lookupName(lookups.packages, procedure.packageId);
    dto.zoneIds = procedure.zoneIds;
    dto.zones = toNamedEntities(procedure.zoneIds, lookups.zones);
    dto.date = procedure.date;
    dto.declaredShotCount = procedure.declaredShotCount;
    dto.actualShotCount = procedure.actualShotCount;
    dto.shotCountDifference = procedure.shotCountDifference;
    dto.price = procedure.price;
    dto.originalPrice = procedure.originalPrice;
    dto.loyaltyRewardApplied = procedure.loyaltyRewardApplied;
    dto.freeZoneId = procedure.freeZoneId;
    dto.freeZoneName = lookupName(lookups.zones, procedure.freeZoneId);
    dto.discountAmount = procedure.discountAmount;
    dto.visitNumber = procedure.visitNumber;
    dto.createdAt = procedure.createdAt;
    return dto;
  }

  static toResponseDtoList(
    procedures: Procedure[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): ProcedureResponseDto[] {
    return procedures.map((procedure) => this.toResponseDto(procedure, lookups));
  }
}
