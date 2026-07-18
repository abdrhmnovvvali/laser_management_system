import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
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

export interface ZoneListOptions {
  deviceId?: string;
  pagination?: PaginationParams;
}

export interface IZoneRepository {
  findAll(options?: ZoneListOptions): Promise<PaginatedResult<Zone>>;
  findById(id: string): Promise<Zone | null>;
  findByIds(ids: string[]): Promise<Zone[]>;
  findByNames(names: string[]): Promise<Zone[]>;
  create(data: CreateZoneData): Promise<Zone>;
  update(id: string, data: UpdateZoneData): Promise<Zone>;
  delete(id: string): Promise<void>;
}
