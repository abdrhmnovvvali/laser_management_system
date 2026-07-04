import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateZoneDto {
  @ApiProperty({ example: 'Qoltuqaltı' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  deviceId: string;

  @ApiProperty({ example: 25.0 })
  @IsNumber()
  @Min(0)
  price: number;
}
