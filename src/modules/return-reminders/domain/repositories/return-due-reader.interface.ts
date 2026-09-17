import {
  PaginatedResult,
  PaginationParams,
} from '../../../../shared/pagination/pagination.types';
import { ReturnDueCustomer } from '../entities/return-due-customer.entity';

export const RETURN_DUE_READER = Symbol('IReturnDueReader');

export interface ReturnDueFilters {
  /** Son vizitdən ən azı bu qədər gün keçib (default: 30) */
  minDays: number;
  /** Son vizitdən ən çoxu bu qədər gün keçib — `null` olduqda yuxarı hədd yoxdur */
  maxDays: number | null;
  branchId?: string;
  pagination?: PaginationParams;
}

export interface IReturnDueReader {
  findDueForReturn(
    filters: ReturnDueFilters,
  ): Promise<PaginatedResult<ReturnDueCustomer>>;
}
