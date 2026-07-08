import { NamedEntityDto } from '../dto/named-entity.dto';
import type { NameLookup } from './relation-lookups.interface';

export function lookupName(
  names: NameLookup,
  id: string | null | undefined,
): string | null {
  if (!id) {
    return null;
  }

  return names.get(id) ?? null;
}

export function toNamedEntities(
  ids: string[],
  names: NameLookup,
): NamedEntityDto[] {
  return ids.map((id) => ({
    id,
    name: names.get(id) ?? id,
  }));
}

export function uniqueIds(
  ids: Iterable<string | null | undefined>,
): string[] {
  return [...new Set([...ids].filter((id): id is string => Boolean(id)))];
}

export function collectProcedureRelationIds(
  procedures: Array<{
    customerId: string;
    deviceId: string;
    packageId: string | null;
    zoneIds: string[];
    freeZoneId: string | null;
  }>,
): {
  customerIds: string[];
  deviceIds: string[];
  packageIds: (string | null | undefined)[];
  zoneIds: (string | null | undefined)[];
} {
  return {
    customerIds: procedures.map((procedure) => procedure.customerId),
    deviceIds: procedures.map((procedure) => procedure.deviceId),
    packageIds: procedures.map((procedure) => procedure.packageId),
    zoneIds: procedures.flatMap((procedure) => [
      ...procedure.zoneIds,
      procedure.freeZoneId,
    ]),
  };
}
