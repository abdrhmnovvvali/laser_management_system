export type NameLookup = ReadonlyMap<string, string>;

export interface RelationLookups {
  branches: NameLookup;
  zones: NameLookup;
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
  customers: new Map(),
  devices: new Map(),
  packages: new Map(),
  campaigns: new Map(),
};
