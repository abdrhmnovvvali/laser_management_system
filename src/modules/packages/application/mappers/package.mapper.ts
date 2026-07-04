import { Package } from '../../domain/entities/package.entity';
import { PackageResponseDto } from '../dto/package-response.dto';

export class PackageMapper {
  static toResponseDto(pkg: Package): PackageResponseDto {
    const dto = new PackageResponseDto();
    dto.id = pkg.id;
    dto.name = pkg.name;
    dto.price = pkg.price;
    dto.zoneIds = pkg.zoneIds;
    dto.createdAt = pkg.createdAt;
    return dto;
  }

  static toResponseDtoList(packages: Package[]): PackageResponseDto[] {
    return packages.map((pkg) => this.toResponseDto(pkg));
  }
}
