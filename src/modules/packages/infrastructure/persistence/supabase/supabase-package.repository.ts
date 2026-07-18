import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import {
  unwrap,
  unwrapOrThrow,
} from '../../../../../shared/supabase/supabase-response.util';
import { readPaginatedRows } from '../../../../../shared/supabase/supabase-pagination.util';
import {
  createPaginatedResult,
  toOffset,
} from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { Package } from '../../../domain/entities/package.entity';
import {
  CreatePackageData,
  IPackageRepository,
<<<<<<< HEAD
  PackageListOptions,
=======
  PackageTranslationInput,
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
  UpdatePackageData,
} from '../../../domain/repositories/package.repository.interface';
import {
  PackagePersistenceMapper,
  PackageRow,
} from '../../mappers/package-persistence.mapper';

const TABLE = 'packages';
const TRANSLATIONS_TABLE = 'package_translations';
const JUNCTION_TABLE = 'package_zones';
const SELECT_WITH_RELATIONS =
  '*, package_translations(locale, name), package_zones(zone_id)';

interface PackageZoneLinkRow {
  package_id: string;
  zone_id: string;
}

@Injectable()
export class SupabasePackageRepository implements IPackageRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(
    options?: PackageListOptions,
  ): Promise<PaginatedResult<Package>> {
    let query = this.supabase
      .from(TABLE)
<<<<<<< HEAD
      .select('*', { count: 'exact' })
=======
      .select(SELECT_WITH_RELATIONS)
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
      .order('created_at', { ascending: false });

    if (options?.pagination) {
      const { from, to } = toOffset(options.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<PackageRow>(response);
    return createPaginatedResult(
      await this.mapRowsWithZones(rows),
      total,
      options?.pagination,
    );
  }

  async findById(id: string): Promise<Package | null> {
    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_RELATIONS)
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<PackageRow>(response);
    return row ? PackagePersistenceMapper.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Package[]> {
    if (ids.length === 0) {
      return [];
    }

    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_RELATIONS)
      .in('id', ids);
    const rows = unwrap<PackageRow[]>(response) ?? [];
    return rows.map((row) => PackagePersistenceMapper.toDomain(row));
  }

  async create(data: CreatePackageData): Promise<Package> {
    const insertResponse = await this.supabase
      .from(TABLE)
      .insert({ price: data.price })
      .select('id')
      .single();

    const created = unwrapOrThrow<{ id: string }>(insertResponse);
    await this.replaceTranslations(created.id, data.translations);
    await this.replaceZoneLinks(created.id, data.zoneIds);

    const pkg = await this.findById(created.id);
    if (!pkg) {
      throw new Error('Package create sonrası tapılmadı');
    }
    return pkg;
  }

  async update(id: string, data: UpdatePackageData): Promise<Package> {
    if (data.price !== undefined) {
      const response = await this.supabase
        .from(TABLE)
        .update({ price: data.price })
        .eq('id', id)
        .select('id')
        .single();
      unwrapOrThrow(response);
    }

    if (data.translations) {
      await this.replaceTranslations(id, data.translations);
    }

    if (data.zoneIds) {
      await this.replaceZoneLinks(id, data.zoneIds);
    }

    const pkg = await this.findById(id);
    if (!pkg) {
      throw new Error('Package update sonrası tapılmadı');
    }
    return pkg;
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }

<<<<<<< HEAD
  private async mapRowsWithZones(rows: PackageRow[]): Promise<Package[]> {
    const zoneIdsByPackage = await this.fetchZoneIdsByPackageIds(
      rows.map((row) => row.id),
    );

    return rows.map((row) =>
      PackagePersistenceMapper.toDomain(
        row,
        zoneIdsByPackage.get(row.id) ?? [],
      ),
    );
  }

  private async fetchZoneIdsByPackageIds(
    packageIds: string[],
  ): Promise<Map<string, string[]>> {
    const zoneIdsByPackage = new Map<string, string[]>();
    if (packageIds.length === 0) {
      return zoneIdsByPackage;
    }

    const response = await this.supabase
      .from(JUNCTION_TABLE)
      .select('package_id, zone_id')
      .in('package_id', packageIds);

    const links = unwrap<PackageZoneLinkRow[]>(response) ?? [];
    for (const link of links) {
      const existing = zoneIdsByPackage.get(link.package_id) ?? [];
      existing.push(link.zone_id);
      zoneIdsByPackage.set(link.package_id, existing);
    }

    return zoneIdsByPackage;
=======
  private async replaceTranslations(
    packageId: string,
    translations: PackageTranslationInput[],
  ): Promise<void> {
    const deleteResponse = await this.supabase
      .from(TRANSLATIONS_TABLE)
      .delete()
      .eq('package_id', packageId);
    unwrap(deleteResponse);

    const insertResponse = await this.supabase.from(TRANSLATIONS_TABLE).insert(
      translations.map((item) => ({
        package_id: packageId,
        locale: item.locale,
        name: item.name,
      })),
    );
    unwrap(insertResponse);
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
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
