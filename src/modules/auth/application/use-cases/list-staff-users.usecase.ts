import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class ListStaffUsersUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(query?: PaginationQueryDto) {
    return this.authRepository.findAllStaffUsers({
      pagination: query ? resolvePagination(query) : undefined,
    });
  }
}
