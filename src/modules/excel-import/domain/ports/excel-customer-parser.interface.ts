import { RawCustomerRow } from '../entities/raw-customer-row.entity';

export const EXCEL_CUSTOMER_PARSER = Symbol('IExcelCustomerParser');

/**
 * Outbound port hiding the concrete Excel library (exceljs) from the
 * application layer (Dependency Inversion).
 */
export interface IExcelCustomerParser {
  parse(fileBuffer: Buffer): Promise<RawCustomerRow[]>;
}
