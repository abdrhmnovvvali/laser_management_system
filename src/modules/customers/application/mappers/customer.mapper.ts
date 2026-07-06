import {
  BranchNameLookup,
  lookupBranchName,
} from '../../../../shared/branch/branch-name.util';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerResponseDto } from '../dto/customer-response.dto';

export class CustomerMapper {
  static toResponseDto(
    customer: Customer,
    branchNames: BranchNameLookup = new Map(),
  ): CustomerResponseDto {
    const dto = new CustomerResponseDto();
    dto.id = customer.id;
    dto.firstName = customer.firstName;
    dto.lastName = customer.lastName;
    dto.phone = customer.phone;
    dto.birthDate = customer.birthDate;
    dto.gender = customer.gender;
    dto.branchId = customer.branchId;
    dto.branchName = lookupBranchName(customer.branchId, branchNames);
    dto.registeredAt = customer.registeredAt;
    return dto;
  }

  static toResponseDtoList(
    customers: Customer[],
    branchNames: BranchNameLookup = new Map(),
  ): CustomerResponseDto[] {
    return customers.map((customer) =>
      this.toResponseDto(customer, branchNames),
    );
  }
}
