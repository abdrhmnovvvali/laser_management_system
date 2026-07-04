import { Procedure } from '../../domain/entities/procedure.entity';
import { ProcedureResponseDto } from '../dto/procedure-response.dto';

export class ProcedureMapper {
  static toResponseDto(procedure: Procedure): ProcedureResponseDto {
    const dto = new ProcedureResponseDto();
    dto.id = procedure.id;
    dto.customerId = procedure.customerId;
    dto.deviceId = procedure.deviceId;
    dto.packageId = procedure.packageId;
    dto.zoneIds = procedure.zoneIds;
    dto.date = procedure.date;
    dto.declaredShotCount = procedure.declaredShotCount;
    dto.actualShotCount = procedure.actualShotCount;
    dto.shotCountDifference = procedure.shotCountDifference;
    dto.price = procedure.price;
    dto.createdAt = procedure.createdAt;
    return dto;
  }

  static toResponseDtoList(procedures: Procedure[]): ProcedureResponseDto[] {
    return procedures.map((procedure) => this.toResponseDto(procedure));
  }
}
