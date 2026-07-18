import { Locale } from '../../../../shared/i18n/locale.enum';
import {
  PaginatedResult,
  PaginationParams,
} from '../../../../shared/pagination/pagination.types';
import { Zone } from '../entities/zone.entity';

export const ZONE_REPOSITORY = Symbol('IZoneRepository');

export interface ZoneTranslationInput {
  locale: Locale;
  name: string;
}

export interface CreateZoneData {
  deviceId: string;
  price: number;
  translations: ZoneTranslationInput[];
}

export interface UpdateZoneData {
  price?: number;
  translations?: ZoneTranslationInput[];
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
