import { Device } from '../../domain/entities/device.entity';

export interface DeviceRow {
  id: string;
  branch_id: string;
  type: string;
  shot_counter: number;
  created_at: string;
}

export class DevicePersistenceMapper {
  static toDomain(row: DeviceRow): Device {
    return new Device(
      row.id,
      new Date(row.created_at),
      row.branch_id,
      row.type,
      row.shot_counter,
    );
  }
}
