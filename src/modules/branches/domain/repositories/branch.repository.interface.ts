import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { Branch } from '../entities/branch.entity';

export const BRANCH_REPOSITORY = Symbol('IBranchRepository');

export interface CreateBranchData {
  name: string;
  address?: string | null;
}

export interface UpdateBranchData {
  name?: string;
  address?: string | null;
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
