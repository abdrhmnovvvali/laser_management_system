import { Campaign } from '../../domain/entities/campaign.entity';
import { CampaignResponseDto } from '../dto/campaign-response.dto';

export class CampaignMapper {
  static toResponseDto(campaign: Campaign): CampaignResponseDto {
    const dto = new CampaignResponseDto();
    dto.id = campaign.id;
    dto.name = campaign.name;
    dto.description = campaign.description;
    dto.discountType = campaign.discountType;
    dto.discountValue = campaign.discountValue;
    dto.startDate = campaign.startDate;
    dto.endDate = campaign.endDate;
    dto.isActive = campaign.isActiveOn(new Date());
    dto.zoneIds = campaign.zoneIds;
    dto.createdAt = campaign.createdAt;
    return dto;
  }

  static toResponseDtoList(campaigns: Campaign[]): CampaignResponseDto[] {
    return campaigns.map((campaign) => this.toResponseDto(campaign));
  }
}
