import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import {
  unwrap,
  unwrapOrThrow,
} from '../../../../../shared/supabase/supabase-response.util';
import { Package } from '../../../domain/entities/package.entity';
import {
  CreatePackageData,
  IPackageRepository,
  UpdatePackageData,
} from '../../../domain/repositories/package.repository.interface';
import {
  PackagePersistenceMapper,
  PackageRow,
} from '../../mappers/package-persistence.mapper';

const TABLE = 'packages';
const JUNCTION_TABLE = 'package_zones';
const SELECT_WITH_ZONES = '*, package_zones(zone_id)';

@Injectable()
export class SupabasePackageRepository implements IPackageRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(): Promise<Package[]> {
    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_ZONES)
      .order('created_at', { ascending: false });

    const rows = unwrap<PackageRow[]>(response) ?? [];
    return rows.map((row) => PackagePersistenceMapper.toDomain(row));
  }

  async findById(id: string): Promise<Package | null> {
    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_ZONES)
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<PackageRow>(response);
    return row ? PackagePersistenceMapper.toDomain(row) : null;
  }

  async create(data: CreatePackageData): Promise<Package> {
    const insertResponse = await this.supabase
      .from(TABLE)
      .insert({ name: data.name, price: data.price })
      .select('*')
      .single();

    const created = unwrapOrThrow<{ id: string }>(insertResponse);
    await this.replaceZoneLinks(created.id, data.zoneIds);

    return this.findById(created.id) as Promise<Package>;
  }

  async update(id: string, data: UpdatePackageData): Promise<Package> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.price !== undefined) payload.price = data.price;

    if (Object.keys(payload).length > 0) {
      const response = await this.supabase
        .from(TABLE)
        .update(payload)
        .eq('id', id);
      unwrap(response);
    }

    if (data.zoneIds) {
      await this.replaceZoneLinks(id, data.zoneIds);
    }

    return this.findById(id) as Promise<Package>;
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }

  private async replaceZoneLinks(
    packageId: string,
    zoneIds: string[],
  ): Promise<void> {
    const deleteResponse = await this.supabase
      .from(JUNCTION_TABLE)
      .delete()
      .eq('package_id', packageId);
    unwrap(deleteResponse);

    if (zoneIds.length === 0) {
      return;
    }

    const insertResponse = await this.supabase
      .from(JUNCTION_TABLE)
      .insert(
        zoneIds.map((zoneId) => ({ package_id: packageId, zone_id: zoneId })),
      );
    unwrap(insertResponse);
  }
}
