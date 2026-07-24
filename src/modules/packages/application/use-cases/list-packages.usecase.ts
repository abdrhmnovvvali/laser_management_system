import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import { PACKAGE_REPOSITORY } from '../../domain/repositories/package.repository.interface';
import type { IPackageRepository } from '../../domain/repositories/package.repository.interface';

@Injectable()
export class ListPackagesUseCase {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
  ) {}

  async execute(
    query?: PaginationQueryDto,
    options?: { skipPagination?: boolean },
  ) {
    return this.packageRepository.findAll({
      pagination:
        options?.skipPagination || !query
          ? undefined
          : resolvePagination(query),
    });
  }
}
