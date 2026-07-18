import { Inject, Injectable } from '@nestjs/common';
import { createPaginatedResult, resolvePagination } from '../../../../shared/pagination/pagination.util';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { PROCEDURE_REPOSITORY } from '../../domain/repositories/procedure.repository.interface';
import type {
  IProcedureRepository,
  ProcedureFilters,
} from '../../domain/repositories/procedure.repository.interface';
import { ListProceduresQueryDto } from '../dto/list-procedures-query.dto';

@Injectable()
export class ListProceduresUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY)
    private readonly procedureRepository: IProcedureRepository,
    private readonly zoneFacade: ZoneFacade,
  ) {}

  async execute(
    query: ListProceduresQueryDto & Partial<ProcedureFilters>,
    options?: { skipPagination?: boolean },
  ) {
    const { zoneNames, ...filters } = query;
    const procedureFilters: ProcedureFilters = { ...filters };

    if (zoneNames?.length) {
      const zoneIds = await this.zoneFacade.findIdsByNames(zoneNames);
      if (zoneIds.length === 0) {
        return createPaginatedResult(
          [],
          0,
          options?.skipPagination ? undefined : resolvePagination(query),
        );
      }
      procedureFilters.zoneIds = zoneIds;
    }

    return this.procedureRepository.findAll({
      ...procedureFilters,
      pagination: options?.skipPagination
        ? undefined
        : resolvePagination(query),
    });
  }
}
