import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Gənclik filialı' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Bakı, Gənclik metrosu yaxınlığı', required: false })
  @IsOptional()
  @IsString()
  address?: string;
}
