import { Injectable } from '@nestjs/common';
import { Procedure } from '../domain/entities/procedure.entity';
import type { ProcedureFilters } from '../domain/repositories/procedure.repository.interface';
import { GetProcedureUseCase } from './use-cases/get-procedure.usecase';
import { ListProceduresUseCase } from './use-cases/list-procedures.usecase';

/**
 * Public surface for other modules (Dashboard, ExcelImport) needing
 * read access to procedure data.
 */
@Injectable()
export class ProcedureFacade {
  constructor(
    private readonly getProcedureUseCase: GetProcedureUseCase,
    private readonly listProceduresUseCase: ListProceduresUseCase,
  ) {}

  async getById(id: string): Promise<Procedure> {
    return this.getProcedureUseCase.execute(id);
  }

  async listByCustomer(customerId: string): Promise<Procedure[]> {
    return this.listProceduresUseCase.execute({ customerId });
  }

  async list(filters: ProcedureFilters): Promise<Procedure[]> {
    return this.listProceduresUseCase.execute(filters);
  }
}
