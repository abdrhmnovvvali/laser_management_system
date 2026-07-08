import { ApiProperty } from '@nestjs/swagger';

export class NamedEntityDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}
