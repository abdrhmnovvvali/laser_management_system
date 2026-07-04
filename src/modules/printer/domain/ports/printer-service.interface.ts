export const PRINTER_SERVICE = Symbol('IPrinterService');

export interface PrintReceiptData {
  customerId: string;
  procedureId: string;
  amount: number;
}

/**
 * Outbound port for physical receipt printing. Faza 3-də real printer
 * inteqrasiyası (PRINTER_SERVICE_URL) ilə implementasiya olunacaq — hazırkı
 * fazada yalnız interfeys səviyyəsində saxlanılır (bax: spesifikasiya
 * bölmə 3, "Texnologiya Stack-i").
 */
export interface IPrinterService {
  printReceipt(data: PrintReceiptData): Promise<void>;
}
