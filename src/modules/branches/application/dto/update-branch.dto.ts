import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branch.dto';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
  @ApiProperty({ example: 'Gənclik filialı', required: false })
  declare name?: string;
}
