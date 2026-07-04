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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateFollowUpUseCase } from '../../application/use-cases/create-follow-up.usecase';
import { DeleteFollowUpUseCase } from '../../application/use-cases/delete-follow-up.usecase';
import { GetFollowUpUseCase } from '../../application/use-cases/get-follow-up.usecase';
import { ListFollowUpsByCustomerUseCase } from '../../application/use-cases/list-follow-ups-by-customer.usecase';
import { ListUpcomingFollowUpsUseCase } from '../../application/use-cases/list-upcoming-follow-ups.usecase';
import { UpdateFollowUpUseCase } from '../../application/use-cases/update-follow-up.usecase';
import { CreateFollowUpDto } from '../../application/dto/create-follow-up.dto';
import { FollowUpResponseDto } from '../../application/dto/follow-up-response.dto';
import { UpcomingFollowUpsQueryDto } from '../../application/dto/upcoming-follow-ups-query.dto';
import { UpdateFollowUpDto } from '../../application/dto/update-follow-up.dto';
import { FollowUpMapper } from '../../application/mappers/follow-up.mapper';

@ApiTags('FollowUps')
@ApiBearerAuth('bearerAuth')
@Controller('follow-ups')
export class FollowUpsController {
  constructor(
    private readonly listFollowUpsByCustomerUseCase: ListFollowUpsByCustomerUseCase,
    private readonly listUpcomingFollowUpsUseCase: ListUpcomingFollowUpsUseCase,
    private readonly getFollowUpUseCase: GetFollowUpUseCase,
    private readonly createFollowUpUseCase: CreateFollowUpUseCase,
    private readonly updateFollowUpUseCase: UpdateFollowUpUseCase,
    private readonly deleteFollowUpUseCase: DeleteFollowUpUseCase,
  ) {}

  @Get()
  @ApiQuery({ name: 'customerId', required: true })
  @ApiOperation({ summary: 'Müştərinin planlaşdırılan vizitlərinin siyahısı' })
  @ApiResponse({ status: 200, type: [FollowUpResponseDto] })
  async findAllByCustomer(
    @Query('customerId', ParseUUIDPipe) customerId: string,
  ): Promise<FollowUpResponseDto[]> {
    const followUps =
      await this.listFollowUpsByCustomerUseCase.execute(customerId);
    return FollowUpMapper.toResponseDtoList(followUps);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Yaxınlaşan xatırlatmalar (gün sayına görə)' })
  @ApiResponse({ status: 200, type: [FollowUpResponseDto] })
  async findUpcoming(
    @Query() query: UpcomingFollowUpsQueryDto,
  ): Promise<FollowUpResponseDto[]> {
    const followUps = await this.listUpcomingFollowUpsUseCase.execute(
      query.days ?? 7,
    );
    return FollowUpMapper.toResponseDtoList(followUps);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə xatırlatma məlumatı' })
  @ApiResponse({ status: 200, type: FollowUpResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FollowUpResponseDto> {
    const followUp = await this.getFollowUpUseCase.execute(id);
    return FollowUpMapper.toResponseDto(followUp);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni növbəti vizit planlaşdır' })
  @ApiResponse({ status: 201, type: FollowUpResponseDto })
  async create(@Body() dto: CreateFollowUpDto): Promise<FollowUpResponseDto> {
    const followUp = await this.createFollowUpUseCase.execute({
      ...dto,
      plannedDate: new Date(dto.plannedDate),
    });
    return FollowUpMapper.toResponseDto(followUp);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Xatırlatmanı yenilə (tarix/status)' })
  @ApiResponse({ status: 200, type: FollowUpResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFollowUpDto,
  ): Promise<FollowUpResponseDto> {
    const followUp = await this.updateFollowUpUseCase.execute(id, {
      ...dto,
      plannedDate: dto.plannedDate ? new Date(dto.plannedDate) : undefined,
    });
    return FollowUpMapper.toResponseDto(followUp);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xatırlatmanı sil' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteFollowUpUseCase.execute(id);
  }
}
