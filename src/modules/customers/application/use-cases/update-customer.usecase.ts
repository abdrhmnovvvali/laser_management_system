import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import type {
  ICustomerRepository,
  UpdateCustomerData,
} from '../../domain/repositories/customer.repository.interface';
import { Customer } from '../../domain/entities/customer.entity';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string, data: UpdateCustomerData): Promise<Customer> {
    const existing = await this.customerRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Customer', id);
    }
    return this.customerRepository.update(id, data);
  }
}
