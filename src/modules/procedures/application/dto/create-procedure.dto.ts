import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProcedureDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  deviceId: string;

  @ApiProperty({
    example: 'a1b2c3d4-...',
    required: false,
    description: 'Verilibsə, qiymət paketin qiymətindən götürülür',
  })
  @IsOptional()
  @IsUUID()
  packageId?: string;

  @ApiProperty({
    example: 'a1b2c3d4-...',
    required: false,
    description: 'İstəyə bağlı kampaniya — aktivdirsə endirim qiymətə tətbiq olunur',
  })
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @ApiProperty({
    example: ['a1b2...', 'c3d4...'],
    type: [String],
    required: false,
    description: 'packageId verilməyibsə mütləqdir — seçilən nahiyələr',
  })
  @ValidateIf((dto: CreateProcedureDto) => !dto.packageId)
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  zoneIds?: string[];

  @ApiProperty({
    example: 'a1b2c3d4-...',
    required: false,
    description: '7-ci vizit loyallıq hədiyyəsi üçün pulsuz nahiyə',
  })
  @IsOptional()
  @IsUUID()
  freeZoneId?: string;

  @ApiProperty({ example: '2026-07-03', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 20, description: 'Bəyan edilən atış sayı' })
  @IsInt()
  @Min(0)
  declaredShotCount: number;

  @ApiProperty({
    example: 22,
    description: 'Cihazın göstərdiyi faktiki atış sayı',
  })
  @IsInt()
  @Min(0)
  actualShotCount: number;
}
