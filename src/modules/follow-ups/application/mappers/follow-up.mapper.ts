import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
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
    dto.customerName = lookupName(lookups.customers, followUp.customerId);
    dto.plannedDate = followUp.plannedDate;
    dto.status = followUp.status;
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
