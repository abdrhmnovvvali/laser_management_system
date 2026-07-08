import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { RelationsModule } from './shared/relations/relations.module';
import { SupabaseModule } from './shared/supabase/supabase.module';
import { EventsModule } from './shared/events/events.module';
import { SupabaseAuthGuard } from './shared/guards/supabase-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { DomainExceptionFilter } from './shared/filters/domain-exception.filter';
import { AuthModule } from './modules/auth/presentation/auth.module';
import { BranchesModule } from './modules/branches/presentation/branches.module';
import { DevicesModule } from './modules/devices/presentation/devices.module';
import { CustomersModule } from './modules/customers/presentation/customers.module';
import { ZonesModule } from './modules/zones/presentation/zones.module';
import { PackagesModule } from './modules/packages/presentation/packages.module';
import { ProceduresModule } from './modules/procedures/presentation/procedures.module';
import { FraudDetectionModule } from './modules/fraud-detection/presentation/fraud-detection.module';
import { CampaignsModule } from './modules/campaigns/presentation/campaigns.module';
import { CommunicationModule } from './modules/notes/presentation/communication.module';
import { FollowUpsModule } from './modules/follow-ups/presentation/follow-ups.module';
import { BirthdaysModule } from './modules/birthdays/presentation/birthdays.module';
import { NotificationsModule } from './modules/notifications/presentation/notifications.module';
import { ExcelImportModule } from './modules/excel-import/presentation/excel-import.module';
import { DashboardModule } from './modules/dashboard/presentation/dashboard.module';
import { PrinterModule } from './modules/printer/presentation/printer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    RelationsModule,
    SupabaseModule,
    EventsModule,
    AuthModule,
    BranchesModule,
    DevicesModule,
    CustomersModule,
    ZonesModule,
    PackagesModule,
    ProceduresModule,
    FraudDetectionModule,
    CampaignsModule,
    CommunicationModule,
    FollowUpsModule,
    BirthdaysModule,
    NotificationsModule,
    ExcelImportModule,
    DashboardModule,
    PrinterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: SupabaseAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
  ],
})
export class AppModule {}
