import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { RawCustomerRow } from '../../domain/entities/raw-customer-row.entity';
import { IExcelCustomerParser } from '../../domain/ports/excel-customer-parser.interface';

/**
 * Expected columns (header row, order-independent, case-insensitive):
 * firstName | lastName | phone | birthDate | gender | branchId
 */
const COLUMN_ALIASES: Record<string, keyof Omit<RawCustomerRow, 'rowNumber'>> =
  {
    firstname: 'firstName',
    'first name': 'firstName',
    lastname: 'lastName',
    'last name': 'lastName',
    phone: 'phone',
    birthdate: 'birthDate',
    'birth date': 'birthDate',
    gender: 'gender',
    branchid: 'branchId',
    'branch id': 'branchId',
  };

@Injectable()
export class ExceljsCustomerParser implements IExcelCustomerParser {
  async parse(fileBuffer: Buffer): Promise<RawCustomerRow[]> {
    const workbook = new Workbook();
    await workbook.xlsx.load(fileBuffer as unknown as ArrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return [];
    }

    const headerRow = worksheet.getRow(1);
    const columnIndexMap = this.buildColumnIndexMap(headerRow);

    const rows: RawCustomerRow[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }

      rows.push({
        rowNumber,
        firstName: this.readCell(row, columnIndexMap.firstName),
        lastName: this.readCell(row, columnIndexMap.lastName),
        phone: this.readCell(row, columnIndexMap.phone),
        birthDate: this.readCell(row, columnIndexMap.birthDate),
        gender: this.readCell(row, columnIndexMap.gender),
        branchId: this.readCell(row, columnIndexMap.branchId),
      });
    });

    return rows;
  }

  private buildColumnIndexMap(
    headerRow: import('exceljs').Row,
  ): Partial<Record<keyof Omit<RawCustomerRow, 'rowNumber'>, number>> {
    const map: Partial<
      Record<keyof Omit<RawCustomerRow, 'rowNumber'>, number>
    > = {};

    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const key = this.cellValueToString(cell.value).trim().toLowerCase();
      const mapped = COLUMN_ALIASES[key];
      if (mapped) {
        map[mapped] = colNumber;
      }
    });

    return map;
  }

  private readCell(
    row: import('exceljs').Row,
    colNumber: number | undefined,
  ): string | undefined {
    if (!colNumber) {
      return undefined;
    }
    const value = row.getCell(colNumber).value;
    if (value === null || value === undefined) {
      return undefined;
    }
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return this.cellValueToString(value).trim();
  }

  /**
   * exceljs cell values can be primitives, Dates, or rich objects
   * (formulas, hyperlinks, rich text). This safely extracts a plain string
   * without falling back to '[object Object]'.
   */
  private cellValueToString(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    if (typeof value === 'object') {
      if ('text' in value && typeof value.text === 'string') {
        return (value as { text: string }).text;
      }
      if (
        'result' in value &&
        (typeof value.result === 'string' || typeof value.result === 'number')
      ) {
        return String((value as { result: string | number }).result);
      }
      if (Array.isArray((value as { richText?: unknown }).richText)) {
        return (value as { richText: { text: string }[] }).richText
          .map((fragment) => fragment.text)
          .join('');
      }
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return '';
  }
}
