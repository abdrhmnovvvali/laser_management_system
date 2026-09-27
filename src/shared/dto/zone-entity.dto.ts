import { ApiProperty } from '@nestjs/swagger';
import { PricedEntityDto } from './priced-entity.dto';

/** Nahiyə: ad, qiymət və seans normaları (atış sayı, müddət). */
export class ZoneEntityDto extends PricedEntityDto {
  @ApiProperty({ nullable: true, description: 'Minimum atış sayı' })
  minShots: number | null;

  @ApiProperty({ nullable: true, description: 'Maksimum atış sayı' })
  maxShots: number | null;

  @ApiProperty({ nullable: true, description: 'Minimum müddət (dəq)' })
  minDurationMinutes: number | null;

  @ApiProperty({ nullable: true, description: 'Maksimum müddət (dəq)' })
  maxDurationMinutes: number | null;
}
