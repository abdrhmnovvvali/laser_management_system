import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
import { Device } from '../../domain/entities/device.entity';
import { DeviceResponseDto } from '../dto/device-response.dto';

export class DeviceMapper {
  static toResponseDto(
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

  static toResponseDtoList(
    devices: Device[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): DeviceResponseDto[] {
    return devices.map((device) => this.toResponseDto(device, lookups));
  }
}
