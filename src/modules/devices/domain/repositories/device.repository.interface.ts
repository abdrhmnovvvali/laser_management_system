import { Locale } from '../../../../shared/i18n/locale.enum';
import { Device } from '../entities/device.entity';

export const DEVICE_REPOSITORY = Symbol('IDeviceRepository');

export interface DeviceTranslationInput {
  locale: Locale;
  type: string;
}

export interface CreateDeviceData {
  branchId: string;
  shotCounter?: number;
  translations: DeviceTranslationInput[];
}

export interface UpdateDeviceData {
  shotCounter?: number;
  translations?: DeviceTranslationInput[];
}

export interface IDeviceRepository {
  findAll(branchId?: string): Promise<Device[]>;
  findById(id: string): Promise<Device | null>;
  findByIds(ids: string[]): Promise<Device[]>;
  create(data: CreateDeviceData): Promise<Device>;
  update(id: string, data: UpdateDeviceData): Promise<Device>;
  incrementShotCounter(id: string, byAmount: number): Promise<Device>;
  delete(id: string): Promise<void>;
}
