import { Injectable } from '@nestjs/common';
import { Customer } from '../domain/entities/customer.entity';
import type {
  CreateCustomerData,
  CustomerFilters,
} from '../domain/repositories/customer.repository.interface';
import { CreateCustomerUseCase } from './use-cases/create-customer.usecase';
import { GetCustomerUseCase } from './use-cases/get-customer.usecase';
import { ListCustomersUseCase } from './use-cases/list-customers.usecase';

/**
 * Public surface for other modules (Procedure, Note, FollowUp, ExcelImport,
 * Birthday, Dashboard) that need read/write access to customer data.
 */
@Injectable()
export class CustomerFacade {
  constructor(
    private readonly getCustomerUseCase: GetCustomerUseCase,
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
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

  async count(filters: CustomerFilters): Promise<number> {
    const customers = await this.listCustomersUseCase.execute(filters);
    return customers.length;
  }
}
