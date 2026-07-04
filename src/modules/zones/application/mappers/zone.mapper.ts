import { Zone } from '../../domain/entities/zone.entity';
import { ZoneResponseDto } from '../dto/zone-response.dto';

export class ZoneMapper {
  static toResponseDto(zone: Zone): ZoneResponseDto {
    const dto = new ZoneResponseDto();
    dto.id = zone.id;
    dto.name = zone.name;
    dto.deviceId = zone.deviceId;
    dto.price = zone.price;
    dto.createdAt = zone.createdAt;
    return dto;
  }

  static toResponseDtoList(zones: Zone[]): ZoneResponseDto[] {
    return zones.map((zone) => this.toResponseDto(zone));
  }
}
