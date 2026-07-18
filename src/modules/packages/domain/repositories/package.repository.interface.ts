<<<<<<< HEAD
import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
=======
import { Locale } from '../../../../shared/i18n/locale.enum';
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
import { Package } from '../entities/package.entity';

export const PACKAGE_REPOSITORY = Symbol('IPackageRepository');

export interface PackageTranslationInput {
  locale: Locale;
  name: string;
}

export interface CreatePackageData {
  price: number;
  zoneIds: string[];
  translations: PackageTranslationInput[];
}

export interface UpdatePackageData {
  price?: number;
  zoneIds?: string[];
  translations?: PackageTranslationInput[];
}

export interface PackageListOptions {
  pagination?: PaginationParams;
}

export interface IPackageRepository {
  findAll(options?: PackageListOptions): Promise<PaginatedResult<Package>>;
  findById(id: string): Promise<Package | null>;
  findByIds(ids: string[]): Promise<Package[]>;
  create(data: CreatePackageData): Promise<Package>;
  update(id: string, data: UpdatePackageData): Promise<Package>;
  delete(id: string): Promise<void>;
}
