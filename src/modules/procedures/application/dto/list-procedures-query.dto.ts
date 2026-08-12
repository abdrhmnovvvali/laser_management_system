import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';

function parseStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [String(value).trim()].filter(Boolean);
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export class ListProceduresQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @ApiPropertyOptional({
    type: [String],
    description:
      'Nahiyə adları üzrə filtr — bir və ya bir neçə zona (OR məntiqi). Məs: ?zoneNames=Üz&zoneNames=Qol və ya ?zoneNames=Üz,Qol',
    example: ['Üz', 'Qol'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseStringArray(value))
  zoneNames?: string[];

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description:
      'Zona ID-ləri üzrə filtr — bir və ya bir neçə zona (OR məntiqi). Məs: ?zoneIds=<uuid>&zoneIds=<uuid>',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => parseStringArray(value))
  zoneIds?: string[];

  @ApiPropertyOptional({ description: 'Filial ID üzrə filtr (müştəri filialı)' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Paket ID üzrə filtr' })
  @IsOptional()
  @IsUUID()
  packageId?: string;

  @ApiPropertyOptional({ description: 'Kampaniya ID üzrə filtr' })
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Vizit nömrəsi üzrə filtr' })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsInt()
  @Min(1)
  visitNumber?: number;

  @ApiPropertyOptional({ description: 'Bəyan edilən atış sayı üzrə filtr' })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsInt()
  @Min(0)
  declaredShotCount?: number;

  @ApiPropertyOptional({ description: 'Faktiki atış sayı üzrə filtr' })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsInt()
  @Min(0)
  actualShotCount?: number;

  @ApiPropertyOptional({
    description:
      'Atış fərqi üzrə filtr (actualShotCount - declaredShotCount). Məs: ?difference=5',
  })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsInt()
  difference?: number;

  @ApiPropertyOptional({
    description: 'Tarix aralığının başlanğıcı (ISO date). Məs: ?dateFrom=2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Tarix aralığının sonu (ISO date). Məs: ?dateTo=2026-01-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Minimum məbləğ (price >= minPrice)' })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maksimum məbləğ (price <= maxPrice)' })
  @IsOptional()
  @Transform(({ value }) => parseOptionalNumber(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
