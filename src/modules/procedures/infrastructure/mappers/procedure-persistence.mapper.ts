import { Procedure } from '../../domain/entities/procedure.entity';

export interface ProcedureRow {
  id: string;
  customer_id: string;
  device_id: string;
  package_id: string | null;
  date: string;
  declared_shot_count: number;
  actual_shot_count: number;
  price: number;
  created_at: string;
  procedure_zones: { zone_id: string }[] | null;
}

export class ProcedurePersistenceMapper {
  static toDomain(row: ProcedureRow): Procedure {
    return new Procedure(
      row.id,
      new Date(row.created_at),
      row.customer_id,
      row.device_id,
      row.package_id,
      new Date(row.date),
      row.declared_shot_count,
      row.actual_shot_count,
      Number(row.price),
      (row.procedure_zones ?? []).map((pz) => pz.zone_id),
    );
  }
}
