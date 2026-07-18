import { Inject, Injectable } from '@nestjs/common';
import { uniqueIds } from '../../../shared/relations/relation-name.util';
import { Customer } from '../domain/entities/customer.entity';
import { CUSTOMER_REPOSITORY } from '../domain/repositories/customer.repository.interface';
import type { ICustomerRepository } from '../domain/repositories/customer.repository.interface';
import type {
  CreateCustomerData,
  CustomerFilters,
} from '../domain/repositories/customer.repository.interface';
import { CreateCustomerUseCase } from './use-cases/create-customer.usecase';
import { GetCustomerUseCase } from './use-cases/get-customer.usecase';

/**
 * Public surface for other modules (Procedure, Note, FollowUp, ExcelImport,
 * Birthday, Dashboard) that need read/write access to customer data.
 */
@Injectable()
export class CustomerFacade {
  constructor(
    private readonly getCustomerUseCase: GetCustomerUseCase,
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async getById(id: string): Promise<Customer> {
    return this.getCustomerUseCase.execute(id);
  }

  async exists(id: string): Promise<boolean> {
    try {
      await this.getCustomerUseCase.execute(id);
      return true;
    } catch {
      return false;
    }
  }

  async create(data: CreateCustomerData): Promise<Customer> {
    return this.createCustomerUseCase.execute(data);
  }

  async count(filters: Omit<CustomerFilters, 'pagination'>): Promise<number> {
    return this.customerRepository.count(filters);
  }

  async list(filters: CustomerFilters = {}): Promise<Customer[]> {
    return this.listCustomersUseCase.execute(filters);
  }

  async resolveNames(
    customerIds: Iterable<string | null | undefined>,
  ): Promise<Map<string, string>> {
    const ids = uniqueIds(customerIds);
    if (ids.length === 0) {
      return new Map();
    }

    const customers = await this.customerRepository.findByIds(ids);
    return new Map(customers.map((customer) => [customer.id, customer.fullName]));
  }
}
