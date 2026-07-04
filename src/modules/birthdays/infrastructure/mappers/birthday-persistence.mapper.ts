import { BirthdayCustomer } from '../../domain/entities/birthday-customer.entity';

export interface BirthdayRow {
  id: string;
  first_name: string;
  last_name: string;
  branch_id: string;
  birth_date: string;
}

export class BirthdayPersistenceMapper {
  static toDomain(row: BirthdayRow): BirthdayCustomer {
    return new BirthdayCustomer(
      row.id,
      row.first_name,
      row.last_name,
      row.branch_id,
      new Date(row.birth_date),
    );
  }
}
