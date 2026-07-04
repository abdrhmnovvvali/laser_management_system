import { Branch } from '../../domain/entities/branch.entity';

export interface BranchRow {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export class BranchPersistenceMapper {
  static toDomain(row: BranchRow): Branch {
    return new Branch(row.id, new Date(row.created_at), row.name, row.address);
  }
}
