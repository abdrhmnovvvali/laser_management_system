import { Zone } from '../entities/zone.entity';

export const ZONE_REPOSITORY = Symbol('IZoneRepository');

export interface CreateZoneData {
  name: string;
  deviceId: string;
  price: number;
}

export interface UpdateZoneData {
  name?: string;
  price?: number;
}

export interface IZoneRepository {
  findAll(deviceId?: string): Promise<Zone[]>;
  findById(id: string): Promise<Zone | null>;
  findByIds(ids: string[]): Promise<Zone[]>;
  create(data: CreateZoneData): Promise<Zone>;
  update(id: string, data: UpdateZoneData): Promise<Zone>;
  delete(id: string): Promise<void>;
}
