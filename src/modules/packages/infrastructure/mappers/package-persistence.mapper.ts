import { Package } from '../../domain/entities/package.entity';

export interface PackageRow {
  id: string;
  name: string;
  price: number;
  created_at: string;
  package_zones: { zone_id: string }[] | null;
}

export class PackagePersistenceMapper {
  static toDomain(row: PackageRow): Package {
    return new Package(
      row.id,
      new Date(row.created_at),
      row.name,
      Number(row.price),
      (row.package_zones ?? []).map((pz) => pz.zone_id),
    );
  }
}
