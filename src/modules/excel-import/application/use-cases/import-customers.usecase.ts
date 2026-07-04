import { Inject, Injectable } from '@nestjs/common';
import { CustomerFacade } from '../../../customers/application/customer.facade';
import { Gender } from '../../../customers/domain/entities/gender.enum';
import { ImportResult } from '../../domain/entities/import-result.entity';
import { ImportRowError } from '../../domain/entities/import-row-error.entity';
import { RawCustomerRow } from '../../domain/entities/raw-customer-row.entity';
import { EXCEL_CUSTOMER_PARSER } from '../../domain/ports/excel-customer-parser.interface';
import type { IExcelCustomerParser } from '../../domain/ports/excel-customer-parser.interface';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class ImportCustomersUseCase {
  constructor(
    @Inject(EXCEL_CUSTOMER_PARSER)
    private readonly excelParser: IExcelCustomerParser,
    private readonly customerFacade: CustomerFacade,
  ) {}

  async execute(fileBuffer: Buffer): Promise<ImportResult> {
    const rows = await this.excelParser.parse(fileBuffer);
    const errors: ImportRowError[] = [];
    let successCount = 0;

    for (const row of rows) {
      const validationError = this.validate(row);
      if (validationError) {
        errors.push(new ImportRowError(row.rowNumber, validationError));
        continue;
      }

      try {
        await this.customerFacade.create({
          firstName: row.firstName!.trim(),
          lastName: row.lastName!.trim(),
          phone: row.phone?.trim() || null,
          birthDate: row.birthDate ? new Date(row.birthDate) : null,
          gender: row.gender ? (row.gender as Gender) : null,
          branchId: row.branchId!.trim(),
        });
        successCount += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Naməlum xəta';
        errors.push(new ImportRowError(row.rowNumber, message));
      }
    }

    return new ImportResult(rows.length, successCount, errors);
  }

  private validate(row: RawCustomerRow): string | null {
    if (!row.firstName?.trim()) {
      return 'firstName boş ola bilməz';
    }
    if (!row.lastName?.trim()) {
      return 'lastName boş ola bilməz';
    }
    if (!row.branchId?.trim() || !UUID_REGEX.test(row.branchId.trim())) {
      return 'branchId düzgün UUID formatında olmalıdır';
    }
    if (row.birthDate && Number.isNaN(Date.parse(row.birthDate))) {
      return 'birthDate düzgün tarix formatında deyil';
    }
    if (row.gender && !Object.values(Gender).includes(row.gender as Gender)) {
      return `gender yalnız bunlardan biri ola bilər: ${Object.values(Gender).join(', ')}`;
    }
    return null;
  }
}
