import { Package } from '../entities/package.entity';

export const PACKAGE_REPOSITORY = Symbol('IPackageRepository');

export interface CreatePackageData {
  name: string;
  price: number;
  zoneIds: string[];
}

export interface UpdatePackageData {
  name?: string;
  price?: number;
  zoneIds?: string[];
}

export interface IPackageRepository {
  findAll(): Promise<Package[]>;
  findById(id: string): Promise<Package | null>;
  findByIds(ids: string[]): Promise<Package[]>;
  create(data: CreatePackageData): Promise<Package>;
  update(id: string, data: UpdatePackageData): Promise<Package>;
  delete(id: string): Promise<void>;
}
