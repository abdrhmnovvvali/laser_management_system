import { Customer } from '../../domain/entities/customer.entity';
import { Gender } from '../../domain/entities/gender.enum';

export interface CustomerRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  birth_date: string | null;
  gender: Gender | null;
  branch_id: string;
  registered_at: string;
}

export class CustomerPersistenceMapper {
  static toDomain(row: CustomerRow): Customer {
    return new Customer(
      row.id,
      new Date(row.registered_at),
      row.first_name,
      row.last_name,
      row.phone,
      row.birth_date ? new Date(row.birth_date) : null,
      row.gender,
      row.branch_id,
    );
  }
}
