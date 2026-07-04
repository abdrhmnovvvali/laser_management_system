import { Branch } from '../../domain/entities/branch.entity';
import { BranchResponseDto } from '../dto/branch-response.dto';

export class BranchMapper {
  static toResponseDto(branch: Branch): BranchResponseDto {
    const dto = new BranchResponseDto();
    dto.id = branch.id;
    dto.name = branch.name;
    dto.address = branch.address;
    dto.createdAt = branch.createdAt;
    return dto;
  }

  static toResponseDtoList(branches: Branch[]): BranchResponseDto[] {
    return branches.map((branch) => this.toResponseDto(branch));
  }
}
