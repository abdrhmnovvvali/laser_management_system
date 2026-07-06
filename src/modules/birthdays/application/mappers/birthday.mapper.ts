import {
  BranchNameLookup,
  lookupBranchName,
} from '../../../../shared/branch/branch-name.util';
import { BirthdayCustomer } from '../../domain/entities/birthday-customer.entity';
import { BirthdayCustomerResponseDto } from '../dto/birthday-customer-response.dto';

export class BirthdayMapper {
  static toResponseDto(
    customer: BirthdayCustomer,
    branchNames: BranchNameLookup = new Map(),
  ): BirthdayCustomerResponseDto {
    const dto = new BirthdayCustomerResponseDto();
    dto.customerId = customer.customerId;
    dto.firstName = customer.firstName;
    dto.lastName = customer.lastName;
    dto.branchId = customer.branchId;
    dto.branchName = lookupBranchName(customer.branchId, branchNames);
    dto.birthDate = customer.birthDate;
    return dto;
  }

  static toResponseDtoList(
    customers: BirthdayCustomer[],
    branchNames: BranchNameLookup = new Map(),
  ): BirthdayCustomerResponseDto[] {
    return customers.map((customer) =>
      this.toResponseDto(customer, branchNames),
    );
  }
}
