import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
import { Device } from '../../domain/entities/device.entity';
import { DeviceResponseDto } from '../dto/device-response.dto';

export class DeviceMapper {
  static toListDto(
    device: Device,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): DeviceResponseDto {
    const dto = new DeviceResponseDto();
    dto.id = device.id;
    dto.branchId = device.branchId;
    dto.branchName = lookupName(lookups.branches, device.branchId);
    dto.type = device.type;
    dto.shotCounter = device.shotCounter;
    dto.createdAt = device.createdAt;
    return dto;
  }

  static toDetailDto(
    device: Device,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): DeviceResponseDto {
    const dto = this.toListDto(device, lookups);
    dto.translations = device.translations.map((item) => ({
      locale: item.locale,
      type: item.type,
    }));
    return dto;
  }

  static toListDtoList(
    devices: Device[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): DeviceResponseDto[] {
    return devices.map((device) => this.toListDto(device, lookups));
  }
}
