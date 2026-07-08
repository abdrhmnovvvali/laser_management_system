import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerResponseDto } from '../dto/customer-response.dto';

export class CustomerMapper {
  static toResponseDto(
    customer: Customer,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): CustomerResponseDto {
    const dto = new CustomerResponseDto();
    dto.id = customer.id;
    dto.firstName = customer.firstName;
    dto.lastName = customer.lastName;
    dto.phone = customer.phone;
    dto.birthDate = customer.birthDate;
    dto.gender = customer.gender;
    dto.branchId = customer.branchId;
    dto.branchName = lookupName(lookups.branches, customer.branchId);
    dto.registeredAt = customer.registeredAt;
    return dto;
  }

  static toResponseDtoList(
    customers: Customer[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): CustomerResponseDto[] {
    return customers.map((customer) => this.toResponseDto(customer, lookups));
  }
}
