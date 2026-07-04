import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Gender } from '../../domain/entities/gender.enum';

export class ListCustomersQueryDto {
  @ApiPropertyOptional({ description: 'Filial üzrə filtr' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Bu nahiyədə prosedur alan müştərilər' })
  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @ApiPropertyOptional({ description: 'Ad, soyad və ya telefon üzrə axtarış' })
  @IsOptional()
  @IsString()
  search?: string;
}
