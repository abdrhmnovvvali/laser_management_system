import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { BasePrismaBirthdayReader } from './base-prisma-birthday-reader';

@Injectable()
export class PrismaBirthdayReader extends BasePrismaBirthdayReader {
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
