import { Branch } from '../../domain/entities/branch.entity';
import { BranchResponseDto } from '../dto/branch-response.dto';

export class BranchMapper {
  static toListDto(branch: Branch): BranchResponseDto {
    const dto = new BranchResponseDto();
    dto.id = branch.id;
    dto.name = branch.name;
    dto.address = branch.address;
    dto.createdAt = branch.createdAt;
    return dto;
  }

  static toDetailDto(branch: Branch): BranchResponseDto {
    const dto = this.toListDto(branch);
    dto.translations = branch.translations.map((item) => ({
      locale: item.locale,
      name: item.name,
      address: item.address,
    }));
    return dto;
  }

  static toListDtoList(branches: Branch[]): BranchResponseDto[] {
    return branches.map((branch) => this.toListDto(branch));
  }
}
