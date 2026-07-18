<<<<<<< HEAD
import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
=======
import { Locale } from '../../../../shared/i18n/locale.enum';
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
import { Branch } from '../entities/branch.entity';

export const BRANCH_REPOSITORY = Symbol('IBranchRepository');

export interface BranchTranslationInput {
  locale: Locale;
  name: string;
  address?: string | null;
}

export interface CreateBranchData {
  translations: BranchTranslationInput[];
}

export interface UpdateBranchData {
  translations?: BranchTranslationInput[];
}

export interface BranchListOptions {
  pagination?: PaginationParams;
}

export interface IBranchRepository {
  findAll(options?: BranchListOptions): Promise<PaginatedResult<Branch>>;
  findById(id: string): Promise<Branch | null>;
  create(data: CreateBranchData): Promise<Branch>;
  update(id: string, data: UpdateBranchData): Promise<Branch>;
  delete(id: string): Promise<void>;
}
