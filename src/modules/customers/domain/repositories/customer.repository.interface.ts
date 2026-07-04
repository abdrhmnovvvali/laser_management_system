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
}

export interface ICustomerRepository {
  findAll(filters: CustomerFilters): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  create(data: CreateCustomerData): Promise<Customer>;
  update(id: string, data: UpdateCustomerData): Promise<Customer>;
  delete(id: string): Promise<void>;
}
