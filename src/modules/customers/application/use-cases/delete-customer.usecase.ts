import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.customerRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Customer', id);
    }
    await this.customerRepository.delete(id);
  }
}
