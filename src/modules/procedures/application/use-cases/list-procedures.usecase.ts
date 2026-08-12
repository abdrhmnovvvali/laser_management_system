import { Inject, Injectable } from '@nestjs/common';
import { createPaginatedResult, resolvePagination } from '../../../../shared/pagination/pagination.util';
import type { PaginationParams } from '../../../../shared/pagination/pagination.types';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { PROCEDURE_REPOSITORY } from '../../domain/repositories/procedure.repository.interface';
import type {
  IProcedureRepository,
  ProcedureFilters,
} from '../../domain/repositories/procedure.repository.interface';

export type ListProceduresInput = {
  customerId?: string;
  deviceId?: string;
  zoneNames?: string[];
  zoneIds?: string[];
  branchId?: string;
  packageId?: string;
  campaignId?: string;
  visitNumber?: number;
  declaredShotCount?: number;
  actualShotCount?: number;
  difference?: number;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  pagination?: PaginationParams;
};

function toDateBound(
  value: string | Date | undefined,
  bound: 'start' | 'end',
): Date | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value;
  }

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  if (dateOnly) {
    if (bound === 'start') {
      date.setUTCHours(0, 0, 0, 0);
    } else {
      date.setUTCHours(23, 59, 59, 999);
    }
  }

  return date;
}

@Injectable()
export class ListProceduresUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY)
    private readonly procedureRepository: IProcedureRepository,
    private readonly zoneFacade: ZoneFacade,
  ) {}

  async execute(
    query: ListProceduresInput,
    options?: { skipPagination?: boolean },
  ) {
    const {
      zoneNames,
      zoneIds: explicitZoneIds,
      dateFrom,
      dateTo,
      page: _page,
      limit: _limit,
      pagination: _pagination,
      ...filters
    } = query;

    const procedureFilters: ProcedureFilters = {
      customerId: filters.customerId,
      deviceId: filters.deviceId,
      branchId: filters.branchId,
      packageId: filters.packageId,
      campaignId: filters.campaignId,
      visitNumber: filters.visitNumber,
      declaredShotCount: filters.declaredShotCount,
      actualShotCount: filters.actualShotCount,
      difference: filters.difference,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      dateFrom: toDateBound(dateFrom, 'start'),
      dateTo: toDateBound(dateTo, 'end'),
      zoneIds: explicitZoneIds,
    };

    if (zoneNames?.length) {
      const zoneIdsFromNames = await this.zoneFacade.findIdsByNames(zoneNames);
      if (zoneIdsFromNames.length === 0 && !explicitZoneIds?.length) {
        return createPaginatedResult(
          [],
          0,
          options?.skipPagination ? undefined : resolvePagination(query),
        );
      }

      procedureFilters.zoneIds = [
        ...new Set([...(explicitZoneIds ?? []), ...zoneIdsFromNames]),
      ];
    }

    return this.procedureRepository.findAll({
      ...procedureFilters,
      pagination: options?.skipPagination
        ? undefined
        : resolvePagination(query),
    });
  }
}
