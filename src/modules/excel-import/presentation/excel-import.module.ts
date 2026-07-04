import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { CustomersModule } from '../../customers/presentation/customers.module';
import { EXCEL_CUSTOMER_PARSER } from '../domain/ports/excel-customer-parser.interface';
import { ExceljsCustomerParser } from '../infrastructure/excel/exceljs-customer-parser';
import { ImportCustomersUseCase } from '../application/use-cases/import-customers.usecase';
import { ExcelImportController } from './controllers/excel-import.controller';

@Module({
  imports: [
    CustomersModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        limits: {
          fileSize:
            configService.get<number>('excelImport.maxFileSizeMb')! *
            1024 *
            1024,
        },
      }),
    }),
  ],
  controllers: [ExcelImportController],
  providers: [
    ImportCustomersUseCase,
    { provide: EXCEL_CUSTOMER_PARSER, useClass: ExceljsCustomerParser },
  ],
})
export class ExcelImportModule {}
