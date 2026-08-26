import { Inject, Injectable } from '@nestjs/common';
import { Procedure } from '../domain/entities/procedure.entity';
import { PROCEDURE_REPOSITORY } from '../domain/repositories/procedure.repository.interface';
import type {
  IProcedureRepository,
  ProcedureFilters,
  ProcedureUsageRankOptions,
  ProcedureUsageRankRow,
} from '../domain/repositories/procedure.repository.interface';
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
    @Inject(PROCEDURE_REPOSITORY)
    private readonly procedureRepository: IProcedureRepository,
  ) {}

  async getById(id: string): Promise<Procedure> {
    return this.getProcedureUseCase.execute(id);
  }

  async listByCustomer(customerId: string): Promise<Procedure[]> {
    const result = await this.listProceduresUseCase.execute(
      { customerId },
      { skipPagination: true },
    );
    return result.items;
  }

  async list(filters: ProcedureFilters): Promise<Procedure[]> {
    const result = await this.listProceduresUseCase.execute(filters, {
      skipPagination: true,
    });
    return result.items;
  }

  async findTopZoneUsage(
    options: ProcedureUsageRankOptions,
  ): Promise<ProcedureUsageRankRow[]> {
    return this.procedureRepository.findTopZoneUsage(options);
  }

  async findTopPackageUsage(
    options: ProcedureUsageRankOptions,
  ): Promise<ProcedureUsageRankRow[]> {
    return this.procedureRepository.findTopPackageUsage(options);
  }

  async findTopCampaignUsage(
    options: ProcedureUsageRankOptions,
  ): Promise<ProcedureUsageRankRow[]> {
    return this.procedureRepository.findTopCampaignUsage(options);
  }
}
