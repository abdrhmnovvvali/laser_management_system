import { Locale } from '../../../../shared/i18n/locale.enum';
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

export interface IZoneRepository {
  findAll(deviceId?: string): Promise<Zone[]>;
  findById(id: string): Promise<Zone | null>;
  findByIds(ids: string[]): Promise<Zone[]>;
  findByNames(names: string[]): Promise<Zone[]>;
  create(data: CreateZoneData): Promise<Zone>;
  update(id: string, data: UpdateZoneData): Promise<Zone>;
  delete(id: string): Promise<void>;
}
