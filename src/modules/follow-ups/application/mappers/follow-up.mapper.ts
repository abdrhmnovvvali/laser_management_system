import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { toNamedEntities } from '../../../../shared/relations/relation-name.util';
import { formatDateOnly } from '../../../../shared/date/date-only.util';
import { FollowUp } from '../../domain/entities/follow-up.entity';
import { FollowUpResponseDto } from '../dto/follow-up-response.dto';

export class FollowUpMapper {
  static toResponseDto(
    followUp: FollowUp,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): FollowUpResponseDto {
    const dto = new FollowUpResponseDto();
    dto.id = followUp.id;
    dto.customerId = followUp.customerId;
    dto.customerName = lookups.customers.get(followUp.customerId) ?? null;
    dto.deviceId = followUp.deviceId;
    dto.deviceName = lookups.devices.get(followUp.deviceId) ?? null;
    dto.plannedDate = formatDateOnly(followUp.plannedDate);
    dto.plannedTime = followUp.plannedTime;
    dto.status = followUp.status;
    dto.zoneIds = followUp.zoneIds;
    dto.zones = toNamedEntities(followUp.zoneIds, lookups.zones);
    dto.createdAt = followUp.createdAt;
    return dto;
  }

  static toResponseDtoList(
    followUps: FollowUp[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): FollowUpResponseDto[] {
    return followUps.map((followUp) => this.toResponseDto(followUp, lookups));
  }
}
