/**
 * Untyped/unvalidated row exactly as read from the spreadsheet. The
 * application layer is responsible for validating and converting it into a
 * CreateCustomerData before persisting.
 */
export interface RawCustomerRow {
  rowNumber: number;
  firstName: string | undefined;
  lastName: string | undefined;
  phone: string | undefined;
  birthDate: string | undefined;
  gender: string | undefined;
  branchId: string | undefined;
}
