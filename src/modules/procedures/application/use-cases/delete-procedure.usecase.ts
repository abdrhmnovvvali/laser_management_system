import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { PROCEDURE_REPOSITORY } from '../../domain/repositories/procedure.repository.interface';
import type { IProcedureRepository } from '../../domain/repositories/procedure.repository.interface';

@Injectable()
export class DeleteProcedureUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY)
    private readonly procedureRepository: IProcedureRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.procedureRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Procedure', id);
    }
    await this.procedureRepository.delete(id);
  }
}
