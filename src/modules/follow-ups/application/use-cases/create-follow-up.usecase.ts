import { Inject, Injectable } from '@nestjs/common';
import { CustomerFacade } from '../../../customers/application/customer.facade';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type {
  CreateFollowUpData,
  IFollowUpRepository,
} from '../../domain/repositories/follow-up.repository.interface';
import { FollowUp } from '../../domain/entities/follow-up.entity';

@Injectable()
export class CreateFollowUpUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
    private readonly customerFacade: CustomerFacade,
  ) {}

  async execute(data: CreateFollowUpData): Promise<FollowUp> {
    await this.customerFacade.getById(data.customerId);
    return this.followUpRepository.create(data);
  }
}
