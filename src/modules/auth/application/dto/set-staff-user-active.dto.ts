import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetStaffUserActiveDto {
  @ApiProperty({
    example: false,
    description: 'false — hesab deaktiv edilir və daxil ola bilmir',
  })
  @IsBoolean()
  isActive: boolean;
}
