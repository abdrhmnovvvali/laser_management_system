import { FollowUp } from '../../domain/entities/follow-up.entity';
import { FollowUpResponseDto } from '../dto/follow-up-response.dto';

export class FollowUpMapper {
  static toResponseDto(followUp: FollowUp): FollowUpResponseDto {
    const dto = new FollowUpResponseDto();
    dto.id = followUp.id;
    dto.customerId = followUp.customerId;
    dto.plannedDate = followUp.plannedDate;
    dto.status = followUp.status;
    dto.createdAt = followUp.createdAt;
    return dto;
  }

  static toResponseDtoList(followUps: FollowUp[]): FollowUpResponseDto[] {
    return followUps.map((followUp) => this.toResponseDto(followUp));
  }
}
