import { Locale } from '../../../../shared/i18n/locale.enum';
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

export interface IBranchRepository {
  findAll(): Promise<Branch[]>;
  findById(id: string): Promise<Branch | null>;
  create(data: CreateBranchData): Promise<Branch>;
  update(id: string, data: UpdateBranchData): Promise<Branch>;
  delete(id: string): Promise<void>;
}
