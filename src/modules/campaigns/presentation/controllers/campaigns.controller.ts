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
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { Role } from '../../../../shared/guards/roles.enum';
import { RelationLookupService } from '../../../../shared/relations/relation-lookup.service';
import { CreateCampaignUseCase } from '../../application/use-cases/create-campaign.usecase';
import { DeleteCampaignUseCase } from '../../application/use-cases/delete-campaign.usecase';
import { GetCampaignUseCase } from '../../application/use-cases/get-campaign.usecase';
import { ListActiveCampaignsUseCase } from '../../application/use-cases/list-active-campaigns.usecase';
import { ListCampaignsUseCase } from '../../application/use-cases/list-campaigns.usecase';
import { UpdateCampaignUseCase } from '../../application/use-cases/update-campaign.usecase';
import { CampaignResponseDto } from '../../application/dto/campaign-response.dto';
import { CreateCampaignDto } from '../../application/dto/create-campaign.dto';
import { UpdateCampaignDto } from '../../application/dto/update-campaign.dto';
import { CampaignMapper } from '../../application/mappers/campaign.mapper';

const PaginatedCampaignsResponseDto = createPaginatedResponseDtoClass(
  CampaignResponseDto,
  'PaginatedCampaignsResponseDto',
);

@ApiTags('Campaigns')
@ApiBearerAuth('bearerAuth')
@Controller('campaigns')
export class CampaignsController {
  constructor(
    private readonly listCampaignsUseCase: ListCampaignsUseCase,
    private readonly listActiveCampaignsUseCase: ListActiveCampaignsUseCase,
    private readonly getCampaignUseCase: GetCampaignUseCase,
    private readonly createCampaignUseCase: CreateCampaignUseCase,
    private readonly updateCampaignUseCase: UpdateCampaignUseCase,
    private readonly deleteCampaignUseCase: DeleteCampaignUseCase,
    private readonly relationLookupService: RelationLookupService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Bütün kampaniyaların siyahısı' })
  @ApiResponse({ status: 200, type: PaginatedCampaignsResponseDto })
  async findAll(@Query() query: PaginationQueryDto) {
    const result = await this.listCampaignsUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      zoneIds: result.items.flatMap((campaign) => campaign.zoneIds),
    });
<<<<<<< HEAD
    return createPaginatedResponseDto(
      result,
      CampaignMapper.toResponseDtoList(result.items, lookups),
    );
=======
    return CampaignMapper.toListDtoList(campaigns, lookups);
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
  }

  @Get('active')
  @ApiOperation({ summary: 'Bugünkü tarixə görə aktiv kampaniyalar' })
  @ApiResponse({ status: 200, type: PaginatedCampaignsResponseDto })
  async findActive(@Query() query: PaginationQueryDto) {
    const result = await this.listActiveCampaignsUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      zoneIds: result.items.flatMap((campaign) => campaign.zoneIds),
    });
<<<<<<< HEAD
    return createPaginatedResponseDto(
      result,
      CampaignMapper.toResponseDtoList(result.items, lookups),
    );
=======
    return CampaignMapper.toListDtoList(campaigns, lookups);
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə kampaniya məlumatı (translations daxil)' })
  @ApiResponse({ status: 200, type: CampaignResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CampaignResponseDto> {
    const campaign = await this.getCampaignUseCase.execute(id);
    const lookups = await this.relationLookupService.load({
      zoneIds: campaign.zoneIds,
    });
    return CampaignMapper.toDetailDto(campaign, lookups);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Yeni kampaniya yarat (yalnız admin)' })
  @ApiResponse({ status: 201, type: CampaignResponseDto })
  async create(@Body() dto: CreateCampaignDto): Promise<CampaignResponseDto> {
    const campaign = await this.createCampaignUseCase.execute({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
    return CampaignMapper.toDetailDto(campaign);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Kampaniyanı yenilə (yalnız admin)' })
  @ApiResponse({ status: 200, type: CampaignResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
  ): Promise<CampaignResponseDto> {
    const campaign = await this.updateCampaignUseCase.execute(id, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
    return CampaignMapper.toDetailDto(campaign);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Kampaniyanı sil (yalnız admin)' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteCampaignUseCase.execute(id);
  }
}
