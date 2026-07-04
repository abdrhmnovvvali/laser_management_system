import { Inject, Injectable } from '@nestjs/common';
import { PROCEDURE_REPOSITORY } from '../../domain/repositories/procedure.repository.interface';
import type {
  IProcedureRepository,
  ProcedureFilters,
} from '../../domain/repositories/procedure.repository.interface';
import { Procedure } from '../../domain/entities/procedure.entity';

@Injectable()
export class ListProceduresUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY)
    private readonly procedureRepository: IProcedureRepository,
  ) {}

  async execute(filters: ProcedureFilters): Promise<Procedure[]> {
    return this.procedureRepository.findAll(filters);
  }
}
