import { Inject, Injectable } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import type {
  CustomerFilters,
  ICustomerRepository,
} from '../../domain/repositories/customer.repository.interface';
import { Customer } from '../../domain/entities/customer.entity';

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(filters: CustomerFilters): Promise<Customer[]> {
    return this.customerRepository.findAll(filters);
  }
}
