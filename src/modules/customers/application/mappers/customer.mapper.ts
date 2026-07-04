import { Customer } from '../../domain/entities/customer.entity';
import { CustomerResponseDto } from '../dto/customer-response.dto';

export class CustomerMapper {
  static toResponseDto(customer: Customer): CustomerResponseDto {
    const dto = new CustomerResponseDto();
    dto.id = customer.id;
    dto.firstName = customer.firstName;
    dto.lastName = customer.lastName;
    dto.phone = customer.phone;
    dto.birthDate = customer.birthDate;
    dto.gender = customer.gender;
    dto.branchId = customer.branchId;
    dto.registeredAt = customer.registeredAt;
    return dto;
  }

  static toResponseDtoList(customers: Customer[]): CustomerResponseDto[] {
    return customers.map((customer) => this.toResponseDto(customer));
  }
}
