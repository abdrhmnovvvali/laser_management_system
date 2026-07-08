import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
import { Zone } from '../../domain/entities/zone.entity';
import { ZoneResponseDto } from '../dto/zone-response.dto';

export class ZoneMapper {
  static toResponseDto(
    zone: Zone,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): ZoneResponseDto {
    const dto = new ZoneResponseDto();
    dto.id = zone.id;
    dto.name = zone.name;
    dto.deviceId = zone.deviceId;
    dto.deviceName = lookupName(lookups.devices, zone.deviceId);
    dto.price = zone.price;
    dto.createdAt = zone.createdAt;
    return dto;
  }

  static toResponseDtoList(
    zones: Zone[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): ZoneResponseDto[] {
    return zones.map((zone) => this.toResponseDto(zone, lookups));
  }
}
