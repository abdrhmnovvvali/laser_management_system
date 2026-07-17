import { Locale } from '../../../../shared/i18n/locale.enum';
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

export interface IPackageRepository {
  findAll(): Promise<Package[]>;
  findById(id: string): Promise<Package | null>;
  findByIds(ids: string[]): Promise<Package[]>;
  create(data: CreatePackageData): Promise<Package>;
  update(id: string, data: UpdatePackageData): Promise<Package>;
  delete(id: string): Promise<void>;
}
