import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { toNamedEntities } from '../../../../shared/relations/relation-name.util';
import { Package } from '../../domain/entities/package.entity';
import { PackageResponseDto } from '../dto/package-response.dto';

export class PackageMapper {
  static toResponseDto(
    pkg: Package,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): PackageResponseDto {
    const dto = new PackageResponseDto();
    dto.id = pkg.id;
    dto.name = pkg.name;
    dto.price = pkg.price;
    dto.zoneIds = pkg.zoneIds;
    dto.zones = toNamedEntities(pkg.zoneIds, lookups.zones);
    dto.createdAt = pkg.createdAt;
    return dto;
  }

  static toResponseDtoList(
    packages: Package[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): PackageResponseDto[] {
    return packages.map((pkg) => this.toResponseDto(pkg, lookups));
  }
}
