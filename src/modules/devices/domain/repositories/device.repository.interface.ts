import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { Device } from '../entities/device.entity';

export const DEVICE_REPOSITORY = Symbol('IDeviceRepository');

export interface CreateDeviceData {
  branchId: string;
  type: string;
  shotCounter?: number;
}

export interface UpdateDeviceData {
  type?: string;
  shotCounter?: number;
}

export interface DeviceListOptions {
  branchId?: string;
  pagination?: PaginationParams;
}

export interface IDeviceRepository {
  findAll(options?: DeviceListOptions): Promise<PaginatedResult<Device>>;
  findById(id: string): Promise<Device | null>;
  findByIds(ids: string[]): Promise<Device[]>;
  create(data: CreateDeviceData): Promise<Device>;
  update(id: string, data: UpdateDeviceData): Promise<Device>;
  incrementShotCounter(id: string, byAmount: number): Promise<Device>;
  delete(id: string): Promise<void>;
}
