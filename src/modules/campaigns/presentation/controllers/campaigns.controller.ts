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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { Role } from '../../../../shared/guards/roles.enum';
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
  ) {}

  @Get()
  @ApiOperation({ summary: 'Bütün kampaniyaların siyahısı' })
  @ApiResponse({ status: 200, type: [CampaignResponseDto] })
  async findAll(): Promise<CampaignResponseDto[]> {
    const campaigns = await this.listCampaignsUseCase.execute();
    return CampaignMapper.toResponseDtoList(campaigns);
  }

  @Get('active')
  @ApiOperation({ summary: 'Bugünkü tarixə görə aktiv kampaniyalar' })
  @ApiResponse({ status: 200, type: [CampaignResponseDto] })
  async findActive(): Promise<CampaignResponseDto[]> {
    const campaigns = await this.listActiveCampaignsUseCase.execute();
    return CampaignMapper.toResponseDtoList(campaigns);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə kampaniya məlumatı' })
  @ApiResponse({ status: 200, type: CampaignResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CampaignResponseDto> {
    const campaign = await this.getCampaignUseCase.execute(id);
    return CampaignMapper.toResponseDto(campaign);
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
    return CampaignMapper.toResponseDto(campaign);
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
    return CampaignMapper.toResponseDto(campaign);
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
