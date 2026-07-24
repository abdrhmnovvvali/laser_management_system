import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { Customer } from '../entities/customer.entity';
import { Gender } from '../entities/gender.enum';

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  phone?: string | null;
  birthDate?: Date | null;
  gender?: Gender | null;
  branchId: string;
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  birthDate?: Date | null;
  gender?: Gender | null;
  branchId?: string;
}

export interface CustomerFilters {
  branchId?: string;
  gender?: Gender;
  zoneId?: string;
  search?: string;
  pagination?: PaginationParams;
}

export interface ICustomerRepository {
  findAll(filters: CustomerFilters): Promise<PaginatedResult<Customer>>;
  count(filters: Omit<CustomerFilters, 'pagination'>): Promise<number>;
  findById(id: string): Promise<Customer | null>;
  findByIds(ids: string[]): Promise<Customer[]>;
  create(data: CreateCustomerData): Promise<Customer>;
  update(id: string, data: UpdateCustomerData): Promise<Customer>;
  delete(id: string): Promise<void>;
}
