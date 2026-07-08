import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
import { BirthdayCustomer } from '../../domain/entities/birthday-customer.entity';
import { BirthdayCustomerResponseDto } from '../dto/birthday-customer-response.dto';

export class BirthdayMapper {
  static toResponseDto(
    customer: BirthdayCustomer,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): BirthdayCustomerResponseDto {
    const dto = new BirthdayCustomerResponseDto();
    dto.customerId = customer.customerId;
    dto.firstName = customer.firstName;
    dto.lastName = customer.lastName;
    dto.branchId = customer.branchId;
    dto.branchName = lookupName(lookups.branches, customer.branchId);
    dto.birthDate = customer.birthDate;
    return dto;
  }

  static toResponseDtoList(
    customers: BirthdayCustomer[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): BirthdayCustomerResponseDto[] {
    return customers.map((customer) => this.toResponseDto(customer, lookups));
  }
}
