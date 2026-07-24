import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import type {
  CustomerFilters,
  ICustomerRepository,
} from '../../domain/repositories/customer.repository.interface';
import { ListCustomersQueryDto } from '../dto/list-customers-query.dto';

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(query: ListCustomersQueryDto) {
    const filters: CustomerFilters = {
      branchId: query.branchId,
      gender: query.gender,
      zoneId: query.zoneId,
      search: query.search,
      pagination: resolvePagination(query),
    };
    return this.customerRepository.findAll(filters);
  }
}
