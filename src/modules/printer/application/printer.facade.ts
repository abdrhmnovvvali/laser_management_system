import { Inject, Injectable } from '@nestjs/common';
import {
  PRINTER_SERVICE,
  PrintReceiptData,
} from '../domain/ports/printer-service.interface';
import type { IPrinterService } from '../domain/ports/printer-service.interface';

/**
 * Public surface for other modules (e.g. ProcedureModule) that will need to
 * trigger receipt printing once Faza 3 lands.
 */
@Injectable()
export class PrinterFacade {
  constructor(
    @Inject(PRINTER_SERVICE) private readonly printerService: IPrinterService,
  ) {}

  async printReceipt(data: PrintReceiptData): Promise<void> {
    return this.printerService.printReceipt(data);
  }
}
