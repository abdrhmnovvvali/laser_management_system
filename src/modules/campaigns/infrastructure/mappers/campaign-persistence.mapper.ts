import { Campaign } from '../../domain/entities/campaign.entity';
import { DiscountType } from '../../domain/entities/discount-type.enum';

export interface CampaignRow {
  id: string;
  name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export class CampaignPersistenceMapper {
  static toDomain(row: CampaignRow, zoneIds: string[] = []): Campaign {
    return new Campaign(
      row.id,
      new Date(row.created_at),
      row.name,
      row.description,
      row.discount_type,
      Number(row.discount_value),
      new Date(row.start_date),
      new Date(row.end_date),
      zoneIds,
    );
  }
}
