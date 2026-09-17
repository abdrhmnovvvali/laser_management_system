import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
import { ReturnDueCustomer } from '../../domain/entities/return-due-customer.entity';
import { ReturnDueCustomerResponseDto } from '../dto/return-due-customer-response.dto';

export class ReturnDueMapper {
  static toResponseDto(
    customer: ReturnDueCustomer,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): ReturnDueCustomerResponseDto {
    const dto = new ReturnDueCustomerResponseDto();
    dto.customerId = customer.customerId;
    dto.firstName = customer.firstName;
    dto.lastName = customer.lastName;
    dto.phone = customer.phone;
    dto.branchId = customer.branchId;
    dto.branchName = lookupName(lookups.branches, customer.branchId);
    dto.lastVisitAt = customer.lastVisitAt;
    dto.daysSinceLastVisit = customer.daysSinceLastVisit;
    dto.visitCount = customer.visitCount;
    return dto;
  }

  static toResponseDtoList(
    customers: ReturnDueCustomer[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): ReturnDueCustomerResponseDto[] {
    return customers.map((customer) => this.toResponseDto(customer, lookups));
  }
}
