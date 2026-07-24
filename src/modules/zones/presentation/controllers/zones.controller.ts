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
import { CreateZoneUseCase } from '../../application/use-cases/create-zone.usecase';
import { DeleteZoneUseCase } from '../../application/use-cases/delete-zone.usecase';
import { GetZoneUseCase } from '../../application/use-cases/get-zone.usecase';
import { ListZonesUseCase } from '../../application/use-cases/list-zones.usecase';
import { UpdateZoneUseCase } from '../../application/use-cases/update-zone.usecase';
import { CreateZoneDto } from '../../application/dto/create-zone.dto';
import { ListZonesQueryDto } from '../../application/dto/list-zones-query.dto';
import { UpdateZoneDto } from '../../application/dto/update-zone.dto';
import { ZoneResponseDto } from '../../application/dto/zone-response.dto';
import { ZoneMapper } from '../../application/mappers/zone.mapper';

const PaginatedZonesResponseDto = createPaginatedResponseDtoClass(
  ZoneResponseDto,
  'PaginatedZonesResponseDto',
);

@ApiTags('Zones')
@ApiBearerAuth('bearerAuth')
@Controller('zones')
export class ZonesController {
  constructor(
    private readonly listZonesUseCase: ListZonesUseCase,
    private readonly getZoneUseCase: GetZoneUseCase,
    private readonly createZoneUseCase: CreateZoneUseCase,
    private readonly updateZoneUseCase: UpdateZoneUseCase,
    private readonly deleteZoneUseCase: DeleteZoneUseCase,
    private readonly relationLookupService: RelationLookupService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Nahiyələrin siyahısı (cihaz üzrə filtrlənə bilər)',
  })
  @ApiResponse({ status: 200, type: PaginatedZonesResponseDto })
  async findAll(@Query() query: ListZonesQueryDto) {
    const result = await this.listZonesUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      deviceIds: result.items.map((zone) => zone.deviceId),
    });
    return createPaginatedResponseDto(
      result,
      ZoneMapper.toListDtoList(result.items, lookups),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə nahiyə məlumatı (translations daxil)' })
  @ApiResponse({ status: 200, type: ZoneResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ZoneResponseDto> {
    const zone = await this.getZoneUseCase.execute(id);
    const lookups = await this.relationLookupService.load({
      deviceIds: [zone.deviceId],
    });
    return ZoneMapper.toDetailDto(zone, lookups);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Yeni nahiyə yarat (yalnız admin)' })
  @ApiResponse({ status: 201, type: ZoneResponseDto })
  async create(@Body() dto: CreateZoneDto): Promise<ZoneResponseDto> {
    const zone = await this.createZoneUseCase.execute(dto);
    return ZoneMapper.toDetailDto(zone);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Nahiyəni yenilə (yalnız admin)' })
  @ApiResponse({ status: 200, type: ZoneResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateZoneDto,
  ): Promise<ZoneResponseDto> {
    const zone = await this.updateZoneUseCase.execute(id, dto);
    return ZoneMapper.toDetailDto(zone);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Nahiyəni sil (yalnız admin)' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteZoneUseCase.execute(id);
  }
}
