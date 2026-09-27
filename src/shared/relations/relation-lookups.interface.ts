export type NameLookup = ReadonlyMap<string, string>;
export type PriceLookup = ReadonlyMap<string, number>;

export interface ZoneNormsValue {
  minShots: number | null;
  maxShots: number | null;
  minDurationMinutes: number | null;
  maxDurationMinutes: number | null;
}

export type ZoneNormsLookup = ReadonlyMap<string, ZoneNormsValue>;

export interface RelationLookups {
  branches: NameLookup;
  zones: NameLookup;
  /** Nahiyə id → qiymət (prosedur cavabında nahiyələrin qiymətini göstərmək üçün) */
  zonePrices: PriceLookup;
  /** Nahiyə id → atış sayı və müddət normaları */
  zoneNorms: ZoneNormsLookup;
  customers: NameLookup;
  devices: NameLookup;
  packages: NameLookup;
  campaigns: NameLookup;
}

export interface RelationIds {
  branchIds?: Iterable<string | null | undefined>;
  zoneIds?: Iterable<string | null | undefined>;
  customerIds?: Iterable<string | null | undefined>;
  deviceIds?: Iterable<string | null | undefined>;
  packageIds?: Iterable<string | null | undefined>;
  campaignIds?: Iterable<string | null | undefined>;
}

export const EMPTY_RELATION_LOOKUPS: RelationLookups = {
  branches: new Map(),
  zones: new Map(),
  zonePrices: new Map(),
  zoneNorms: new Map(),
  customers: new Map(),
  devices: new Map(),
  packages: new Map(),
  campaigns: new Map(),
};
