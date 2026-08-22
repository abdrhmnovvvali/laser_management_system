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
import { RelationLookupService } from '../../../../shared/relations/relation-lookup.service';
import { parseDateOnlyString } from '../../../../shared/date/date-only.util';
import { collectFollowUpRelationIds } from '../../../../shared/relations/relation-name.util';
import { CreateFollowUpUseCase } from '../../application/use-cases/create-follow-up.usecase';
import { DeleteFollowUpUseCase } from '../../application/use-cases/delete-follow-up.usecase';
import { GetAvailableReservationSlotsUseCase } from '../../application/use-cases/get-available-reservation-slots.usecase';
import { GetFollowUpUseCase } from '../../application/use-cases/get-follow-up.usecase';
import { ListFollowUpsByCustomerUseCase } from '../../application/use-cases/list-follow-ups-by-customer.usecase';
import { ListUpcomingFollowUpsUseCase } from '../../application/use-cases/list-upcoming-follow-ups.usecase';
import { UpdateFollowUpUseCase } from '../../application/use-cases/update-follow-up.usecase';
import {
  AvailableReservationSlotsQueryDto,
  AvailableReservationSlotsResponseDto,
} from '../../application/dto/available-reservation-slots.dto';
import { CreateFollowUpDto } from '../../application/dto/create-follow-up.dto';
import { FollowUpResponseDto } from '../../application/dto/follow-up-response.dto';
import { ListFollowUpsQueryDto } from '../../application/dto/list-follow-ups-query.dto';
import { UpcomingFollowUpsQueryDto } from '../../application/dto/upcoming-follow-ups-query.dto';
import { UpdateFollowUpDto } from '../../application/dto/update-follow-up.dto';
import { FollowUpMapper } from '../../application/mappers/follow-up.mapper';

const PaginatedFollowUpsResponseDto = createPaginatedResponseDtoClass(
  FollowUpResponseDto,
  'PaginatedFollowUpsResponseDto',
);

@ApiTags('FollowUps')
@ApiBearerAuth('bearerAuth')
@Controller('follow-ups')
export class FollowUpsController {
  constructor(
    private readonly listFollowUpsByCustomerUseCase: ListFollowUpsByCustomerUseCase,
    private readonly listUpcomingFollowUpsUseCase: ListUpcomingFollowUpsUseCase,
    private readonly getAvailableReservationSlotsUseCase: GetAvailableReservationSlotsUseCase,
    private readonly getFollowUpUseCase: GetFollowUpUseCase,
    private readonly createFollowUpUseCase: CreateFollowUpUseCase,
    private readonly updateFollowUpUseCase: UpdateFollowUpUseCase,
    private readonly deleteFollowUpUseCase: DeleteFollowUpUseCase,
    private readonly relationLookupService: RelationLookupService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Rezervasiya siyahısı (istəyə bağlı müştəri/cihaz/tarix/status filtri)',
  })
  @ApiResponse({ status: 200, type: PaginatedFollowUpsResponseDto })
  async findAllByCustomer(@Query() query: ListFollowUpsQueryDto) {
    const result = await this.listFollowUpsByCustomerUseCase.execute(query);
    const lookups = await this.relationLookupService.load(
      collectFollowUpRelationIds(result.items),
    );
    return createPaginatedResponseDto(
      result,
      FollowUpMapper.toResponseDtoList(result.items, lookups),
    );
  }

  @Get('available-slots')
  @ApiOperation({
    summary: 'Seçilmiş cihaz və tarix üçün mövcud rezervasiya slotları',
  })
  @ApiResponse({ status: 200, type: AvailableReservationSlotsResponseDto })
  async getAvailableSlots(
    @Query() query: AvailableReservationSlotsQueryDto,
  ): Promise<AvailableReservationSlotsResponseDto> {
    return this.getAvailableReservationSlotsUseCase.execute({
      deviceId: query.deviceId,
      date: parseDateOnlyString(query.date),
      excludeFollowUpId: query.excludeFollowUpId,
    });
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Yaxınlaşan rezervasiyalar (gün sayına görə)' })
  @ApiResponse({ status: 200, type: PaginatedFollowUpsResponseDto })
  async findUpcoming(@Query() query: UpcomingFollowUpsQueryDto) {
    const result = await this.listUpcomingFollowUpsUseCase.execute(query);
    const lookups = await this.relationLookupService.load(
      collectFollowUpRelationIds(result.items),
    );
    return createPaginatedResponseDto(
      result,
      FollowUpMapper.toResponseDtoList(result.items, lookups),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə rezervasiya məlumatı' })
  @ApiResponse({ status: 200, type: FollowUpResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FollowUpResponseDto> {
    const followUp = await this.getFollowUpUseCase.execute(id);
    const lookups = await this.relationLookupService.load(
      collectFollowUpRelationIds([followUp]),
    );
    return FollowUpMapper.toResponseDto(followUp, lookups);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni rezervasiya yarat' })
  @ApiResponse({ status: 201, type: FollowUpResponseDto })
  async create(@Body() dto: CreateFollowUpDto): Promise<FollowUpResponseDto> {
    const followUp = await this.createFollowUpUseCase.execute({
      ...dto,
      plannedDate: parseDateOnlyString(dto.plannedDate),
    });
    const lookups = await this.relationLookupService.load(
      collectFollowUpRelationIds([followUp]),
    );
    return FollowUpMapper.toResponseDto(followUp, lookups);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rezervasiyanı yenilə' })
  @ApiResponse({ status: 200, type: FollowUpResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFollowUpDto,
  ): Promise<FollowUpResponseDto> {
    const followUp = await this.updateFollowUpUseCase.execute(id, {
      ...dto,
      plannedDate: dto.plannedDate
        ? parseDateOnlyString(dto.plannedDate)
        : undefined,
    });
    const lookups = await this.relationLookupService.load(
      collectFollowUpRelationIds([followUp]),
    );
    return FollowUpMapper.toResponseDto(followUp, lookups);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Rezervasiyanı sil' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteFollowUpUseCase.execute(id);
  }
}
