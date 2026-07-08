import { Inject, Injectable } from '@nestjs/common';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { PROCEDURE_REPOSITORY } from '../../domain/repositories/procedure.repository.interface';
import type {
  IProcedureRepository,
  ProcedureFilters,
} from '../../domain/repositories/procedure.repository.interface';
import { Procedure } from '../../domain/entities/procedure.entity';
import { ListProceduresQueryDto } from '../dto/list-procedures-query.dto';

@Injectable()
export class ListProceduresUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY)
    private readonly procedureRepository: IProcedureRepository,
    private readonly zoneFacade: ZoneFacade,
  ) {}

  async execute(query: ListProceduresQueryDto): Promise<Procedure[]> {
    const { zoneNames, ...filters } = query;
    const procedureFilters: ProcedureFilters = { ...filters };

    if (zoneNames?.length) {
      const zoneIds = await this.zoneFacade.findIdsByNames(zoneNames);
      if (zoneIds.length === 0) {
        return [];
      }
      procedureFilters.zoneIds = zoneIds;
    }

    return this.procedureRepository.findAll(procedureFilters);
  }
}
