import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { PROCEDURE_REPOSITORY } from '../../domain/repositories/procedure.repository.interface';
import type { IProcedureRepository } from '../../domain/repositories/procedure.repository.interface';
import { Procedure } from '../../domain/entities/procedure.entity';

@Injectable()
export class GetProcedureUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY)
    private readonly procedureRepository: IProcedureRepository,
  ) {}

  async execute(id: string): Promise<Procedure> {
    const procedure = await this.procedureRepository.findById(id);
    if (!procedure) {
      throw new EntityNotFoundException('Procedure', id);
    }
    return procedure;
  }
}
