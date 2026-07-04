import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { PROCEDURE_REPOSITORY } from '../../domain/repositories/procedure.repository.interface';
import type {
  IProcedureRepository,
  UpdateProcedureData,
} from '../../domain/repositories/procedure.repository.interface';
import { Procedure } from '../../domain/entities/procedure.entity';

@Injectable()
export class UpdateProcedureUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY)
    private readonly procedureRepository: IProcedureRepository,
  ) {}

  async execute(id: string, data: UpdateProcedureData): Promise<Procedure> {
    const existing = await this.procedureRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Procedure', id);
    }
    return this.procedureRepository.update(id, data);
  }
}
