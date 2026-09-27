import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';

function parseIdList(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const items = Array.isArray(value) ? value : String(value).split(',');
  return items.map((item) => String(item).trim()).filter(Boolean);
}

export class AvailableReservationSlotsQueryDto {
  @ApiProperty({ description: 'Cihaz ID' })
  @IsUUID()
  deviceId: string;

  @ApiProperty({ example: '2026-07-15', description: 'Rezervasiya tarixi' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    description: 'Redaktə zamanı cari rezervasiyanı slot yoxlamasından çıxar',
  })
  @IsOptional()
  @IsUUID()
  excludeFollowUpId?: string;

  @ApiPropertyOptional({
    type: [String],
    description:
      'Yeni seansın nahiyələri — müddət bunlara görə hesablanır. Məs: ?zoneIds=<uuid>&zoneIds=<uuid>',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => parseIdList(value))
  zoneIds?: string[];
}

export class ReservationSlotDto {
  @ApiProperty({ example: '10:30' })
  time: string;

  @ApiProperty({
    description: 'Seçilən nahiyələrin müddəti bu saatdan başlayaraq sığırmı',
  })
  available: boolean;

  @ApiProperty({
    nullable: true,
    example: '09:35',
    description:
      'Əvvəlki seans maksimum müddətə qədər uzanarsa, bu saata qədər davam edə bilər',
  })
  mayOverlapUntil: string | null;
}

export class ReservationBookingDto {
  @ApiProperty()
  followUpId: string;

  @ApiProperty({ example: '09:00' })
  start: string;

  @ApiProperty({ example: '09:25', description: 'Ən tez bitmə vaxtı' })
  minEnd: string;

  @ApiProperty({ example: '09:35', description: 'Ən gec bitmə vaxtı' })
  maxEnd: string;
}

export class AvailableReservationSlotsResponseDto {
  @ApiProperty({ description: 'Yeni seansın minimum müddəti (dəq)' })
  durationMinMinutes: number;

  @ApiProperty({ description: 'Yeni seansın maksimum müddəti (dəq)' })
  durationMaxMinutes: number;

  @ApiProperty({
    type: [ReservationBookingDto],
    description: 'Həmin gün cihazda tutulmuş vaxtlar',
  })
  bookings: ReservationBookingDto[];

  @ApiProperty({ type: [ReservationSlotDto] })
  slots: ReservationSlotDto[];
}
