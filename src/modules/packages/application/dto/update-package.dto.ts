import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePackageDto } from './create-package.dto';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {
  @ApiProperty({ example: 'Tam Bədən Paketi', required: false })
  declare name?: string;
}
