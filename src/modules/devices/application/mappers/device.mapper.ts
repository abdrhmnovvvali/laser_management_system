import { Device } from '../../domain/entities/device.entity';
import { DeviceResponseDto } from '../dto/device-response.dto';

export class DeviceMapper {
  static toResponseDto(device: Device): DeviceResponseDto {
    const dto = new DeviceResponseDto();
    dto.id = device.id;
    dto.branchId = device.branchId;
    dto.type = device.type;
    dto.shotCounter = device.shotCounter;
    dto.createdAt = device.createdAt;
    return dto;
  }

  static toResponseDtoList(devices: Device[]): DeviceResponseDto[] {
    return devices.map((device) => this.toResponseDto(device));
  }
}
