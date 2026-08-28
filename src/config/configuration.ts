export interface AppConfig {
  env: string;
  port: number;
}

export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface SwaggerConfig {
  path: string;
}

export interface ExcelImportConfig {
  maxFileSizeMb: number;
}

export interface PrinterConfig {
  serviceUrl?: string;
}

export interface LoyaltyConfig {
  /** 6 = 7-ci, 14-cü, 21-ci vizitlərdə bir nahiyə pulsuz. 0 = söndürülüb. */
  visitsBeforeFreeZone: number;
}

export interface ReservationConfig {
  /** Günün ilk rezervasiya saatı (HH:mm) */
  slotStart: string;
  /** Günün son rezervasiya saatı (HH:mm, daxil deyil) */
  slotEnd: string;
  /** Slot intervalı (dəqiqə) */
  slotMinutes: number;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  swagger: SwaggerConfig;
  excelImport: ExcelImportConfig;
  printer: PrinterConfig;
  loyalty: LoyaltyConfig;
  reservation: ReservationConfig;
}

export default (): Configuration => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
  swagger: {
    path: process.env.SWAGGER_PATH ?? 'api/docs',
  },
  excelImport: {
    maxFileSizeMb: parseInt(process.env.MAX_IMPORT_FILE_SIZE_MB ?? '10', 10),
  },
  printer: {
    serviceUrl: process.env.PRINTER_SERVICE_URL,
  },
  loyalty: {
    visitsBeforeFreeZone: parseInt(
      process.env.LOYALTY_VISITS_BEFORE_FREE_ZONE ?? '6',
      10,
    ),
  },
  reservation: {
    slotStart: process.env.RESERVATION_SLOT_START ?? '09:00',
    slotEnd: process.env.RESERVATION_SLOT_END ?? '18:00',
    slotMinutes: parseInt(process.env.RESERVATION_SLOT_MINUTES ?? '30', 10),
  },
});
