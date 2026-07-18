import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  createPaginatedResponseDto,
  createPaginatedResponseDtoClass,
} from '../../../../shared/dto/paginated-response.dto';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { Role } from '../../../../shared/guards/roles.enum';
import { RelationLookupService } from '../../../../shared/relations/relation-lookup.service';
import { CreateDeviceUseCase } from '../../application/use-cases/create-device.usecase';
import { DeleteDeviceUseCase } from '../../application/use-cases/delete-device.usecase';
import { GetDeviceUseCase } from '../../application/use-cases/get-device.usecase';
import { ListDevicesUseCase } from '../../application/use-cases/list-devices.usecase';
import { UpdateDeviceUseCase } from '../../application/use-cases/update-device.usecase';
import { CreateDeviceDto } from '../../application/dto/create-device.dto';
import { DeviceResponseDto } from '../../application/dto/device-response.dto';
import { ListDevicesQueryDto } from '../../application/dto/list-devices-query.dto';
import { UpdateDeviceDto } from '../../application/dto/update-device.dto';
import { DeviceMapper } from '../../application/mappers/device.mapper';

const PaginatedDevicesResponseDto = createPaginatedResponseDtoClass(
  DeviceResponseDto,
  'PaginatedDevicesResponseDto',
);

@ApiTags('Devices')
@ApiBearerAuth('bearerAuth')
@Controller('devices')
export class DevicesController {
  constructor(
    private readonly listDevicesUseCase: ListDevicesUseCase,
    private readonly getDeviceUseCase: GetDeviceUseCase,
    private readonly createDeviceUseCase: CreateDeviceUseCase,
    private readonly updateDeviceUseCase: UpdateDeviceUseCase,
    private readonly deleteDeviceUseCase: DeleteDeviceUseCase,
    private readonly relationLookupService: RelationLookupService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Cihazların siyahısı (filial üzrə filtrlənə bilər)',
  })
  @ApiResponse({ status: 200, type: PaginatedDevicesResponseDto })
  async findAll(@Query() query: ListDevicesQueryDto) {
    const result = await this.listDevicesUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      branchIds: result.items.map((device) => device.branchId),
    });
<<<<<<< HEAD
    return createPaginatedResponseDto(
      result,
      DeviceMapper.toResponseDtoList(result.items, lookups),
    );
=======
    return DeviceMapper.toListDtoList(devices, lookups);
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə cihaz məlumatı (translations daxil)' })
  @ApiResponse({ status: 200, type: DeviceResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeviceResponseDto> {
    const device = await this.getDeviceUseCase.execute(id);
    const lookups = await this.relationLookupService.load({
      branchIds: [device.branchId],
    });
    return DeviceMapper.toDetailDto(device, lookups);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Yeni cihaz yarat (yalnız admin)' })
  @ApiResponse({ status: 201, type: DeviceResponseDto })
  async create(@Body() dto: CreateDeviceDto): Promise<DeviceResponseDto> {
    const device = await this.createDeviceUseCase.execute(dto);
    return DeviceMapper.toDetailDto(device);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Cihazı yenilə (yalnız admin)' })
  @ApiResponse({ status: 200, type: DeviceResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    const device = await this.updateDeviceUseCase.execute(id, dto);
    return DeviceMapper.toDetailDto(device);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cihazı sil (yalnız admin)' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteDeviceUseCase.execute(id);
  }
}
