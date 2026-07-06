import {
  BranchNameLookup,
  lookupBranchName,
} from '../../../../shared/branch/branch-name.util';
import { Device } from '../../domain/entities/device.entity';
import { DeviceResponseDto } from '../dto/device-response.dto';

export class DeviceMapper {
  static toResponseDto(
    device: Device,
    branchNames: BranchNameLookup = new Map(),
  ): DeviceResponseDto {
    const dto = new DeviceResponseDto();
    dto.id = device.id;
    dto.branchId = device.branchId;
    dto.branchName = lookupBranchName(device.branchId, branchNames);
    dto.type = device.type;
    dto.shotCounter = device.shotCounter;
    dto.createdAt = device.createdAt;
    return dto;
  }

  static toResponseDtoList(
    devices: Device[],
    branchNames: BranchNameLookup = new Map(),
  ): DeviceResponseDto[] {
    return devices.map((device) => this.toResponseDto(device, branchNames));
  }
}
