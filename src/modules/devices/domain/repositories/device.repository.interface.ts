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

export interface IDeviceRepository {
  findAll(branchId?: string): Promise<Device[]>;
  findById(id: string): Promise<Device | null>;
  findByIds(ids: string[]): Promise<Device[]>;
  create(data: CreateDeviceData): Promise<Device>;
  update(id: string, data: UpdateDeviceData): Promise<Device>;
  incrementShotCounter(id: string, byAmount: number): Promise<Device>;
  delete(id: string): Promise<void>;
}
