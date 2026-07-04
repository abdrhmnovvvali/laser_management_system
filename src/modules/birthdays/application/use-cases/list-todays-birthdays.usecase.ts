import { Inject, Injectable } from '@nestjs/common';
import { BirthdayCustomer } from '../../domain/entities/birthday-customer.entity';
import { BIRTHDAY_READER } from '../../domain/repositories/birthday-reader.interface';
import type { IBirthdayReader } from '../../domain/repositories/birthday-reader.interface';

@Injectable()
export class ListTodaysBirthdaysUseCase {
  constructor(
    @Inject(BIRTHDAY_READER)
    private readonly birthdayReader: IBirthdayReader,
  ) {}

  async execute(): Promise<BirthdayCustomer[]> {
    return this.birthdayReader.findTodaysBirthdays();
  }
}
