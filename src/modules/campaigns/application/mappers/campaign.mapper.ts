import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { toNamedEntities } from '../../../../shared/relations/relation-name.util';
import { Campaign } from '../../domain/entities/campaign.entity';
import { CampaignResponseDto } from '../dto/campaign-response.dto';

export class CampaignMapper {
  static toListDto(
    campaign: Campaign,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): CampaignResponseDto {
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
    dto.zones = toNamedEntities(campaign.zoneIds, lookups.zones);
    dto.createdAt = campaign.createdAt;
    return dto;
  }

  static toDetailDto(
    campaign: Campaign,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): CampaignResponseDto {
    const dto = this.toListDto(campaign, lookups);
    dto.translations = campaign.translations.map((item) => ({
      locale: item.locale,
      name: item.name,
      description: item.description,
    }));
    return dto;
  }

  static toListDtoList(
    campaigns: Campaign[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): CampaignResponseDto[] {
    return campaigns.map((campaign) => this.toListDto(campaign, lookups));
  }
}
