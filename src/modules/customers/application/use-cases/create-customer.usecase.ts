import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { BranchFacade } from '../../../branches/application/branch.facade';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import type {
  CreateCustomerData,
  ICustomerRepository,
} from '../../domain/repositories/customer.repository.interface';
import { Customer } from '../../domain/entities/customer.entity';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    private readonly branchFacade: BranchFacade,
  ) {}

  async execute(data: CreateCustomerData): Promise<Customer> {
    const branchExists = await this.branchFacade.exists(data.branchId);
    if (!branchExists) {
      throw new BusinessRuleViolationException(
        `Filial tapılmadı (id: ${data.branchId})`,
      );
    }
    return this.customerRepository.create(data);
  }
}
