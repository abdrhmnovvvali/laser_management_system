import { BirthdayCustomer } from '../../domain/entities/birthday-customer.entity';
import { BirthdayCustomerResponseDto } from '../dto/birthday-customer-response.dto';

export class BirthdayMapper {
  static toResponseDto(
    customer: BirthdayCustomer,
  ): BirthdayCustomerResponseDto {
    const dto = new BirthdayCustomerResponseDto();
    dto.customerId = customer.customerId;
    dto.firstName = customer.firstName;
    dto.lastName = customer.lastName;
    dto.branchId = customer.branchId;
    dto.birthDate = customer.birthDate;
    return dto;
  }

  static toResponseDtoList(
    customers: BirthdayCustomer[],
  ): BirthdayCustomerResponseDto[] {
    return customers.map((customer) => this.toResponseDto(customer));
  }
}
