import { Module } from '@nestjs/common';
import { PRINTER_SERVICE } from '../domain/ports/printer-service.interface';
import { StubPrinterService } from '../infrastructure/stub-printer.service';
import { PrinterFacade } from '../application/printer.facade';

/**
 * Faza 3 üçün skeleton modul — hazırkı fazada yalnız interfeys/placeholder
 * saxlanılır. Real inteqrasiya olunanda StubPrinterService əvəzinə real
 * PRINTER_SERVICE_URL-ə müraciət edən bir implementasiya veriləcək.
 */
@Module({
  providers: [
    PrinterFacade,
    { provide: PRINTER_SERVICE, useClass: StubPrinterService },
  ],
  exports: [PrinterFacade],
})
export class PrinterModule {}
