import { Zone } from '../../domain/entities/zone.entity';

export interface ZoneRow {
  id: string;
  name: string;
  device_id: string;
  price: number;
  created_at: string;
}

export class ZonePersistenceMapper {
  static toDomain(row: ZoneRow): Zone {
    return new Zone(
      row.id,
      new Date(row.created_at),
      row.name,
      row.device_id,
      Number(row.price),
    );
  }
}
