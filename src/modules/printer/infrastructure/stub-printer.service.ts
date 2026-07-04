import { Injectable, Logger } from '@nestjs/common';
import {
  IPrinterService,
  PrintReceiptData,
} from '../domain/ports/printer-service.interface';

/**
 * Placeholder implementation used until the Faza 3 printer integration
 * (PRINTER_SERVICE_URL) is built. Logs the request instead of printing.
 */
@Injectable()
export class StubPrinterService implements IPrinterService {
  private readonly logger = new Logger(StubPrinterService.name);

  printReceipt(data: PrintReceiptData): Promise<void> {
    this.logger.warn(
      `Printer inteqrasiyası hələ aktiv deyil (Faza 3). Çek çap edilmədi: ${JSON.stringify(data)}`,
    );
    return Promise.resolve();
  }
}
