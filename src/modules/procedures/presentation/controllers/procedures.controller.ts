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
import { CreateProcedureUseCase } from '../../application/use-cases/create-procedure.usecase';
import { DeleteProcedureUseCase } from '../../application/use-cases/delete-procedure.usecase';
import { GetProcedureUseCase } from '../../application/use-cases/get-procedure.usecase';
import { ListProceduresUseCase } from '../../application/use-cases/list-procedures.usecase';
import { UpdateProcedureUseCase } from '../../application/use-cases/update-procedure.usecase';
import { CreateProcedureDto } from '../../application/dto/create-procedure.dto';
import { ListProceduresQueryDto } from '../../application/dto/list-procedures-query.dto';
import { ProcedureResponseDto } from '../../application/dto/procedure-response.dto';
import { UpdateProcedureDto } from '../../application/dto/update-procedure.dto';
import { ProcedureMapper } from '../../application/mappers/procedure.mapper';

@ApiTags('Procedures')
@ApiBearerAuth('bearerAuth')
@Controller('procedures')
export class ProceduresController {
  constructor(
    private readonly listProceduresUseCase: ListProceduresUseCase,
    private readonly getProcedureUseCase: GetProcedureUseCase,
    private readonly createProcedureUseCase: CreateProcedureUseCase,
    private readonly updateProcedureUseCase: UpdateProcedureUseCase,
    private readonly deleteProcedureUseCase: DeleteProcedureUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Prosedurların siyahısı (müştəri/cihaz üzrə filtr)',
  })
  @ApiResponse({ status: 200, type: [ProcedureResponseDto] })
  async findAll(
    @Query() query: ListProceduresQueryDto,
  ): Promise<ProcedureResponseDto[]> {
    const procedures = await this.listProceduresUseCase.execute(query);
    return ProcedureMapper.toResponseDtoList(procedures);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə prosedur məlumatı' })
  @ApiResponse({ status: 200, type: ProcedureResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProcedureResponseDto> {
    const procedure = await this.getProcedureUseCase.execute(id);
    return ProcedureMapper.toResponseDto(procedure);
  }

  @Post()
  @ApiOperation({
    summary:
      'Yeni vizit qeydi yarat — zona/paket seçimi və atış sayları ilə, qiymət avtomatik hesablanır',
  })
  @ApiResponse({ status: 201, type: ProcedureResponseDto })
  async create(@Body() dto: CreateProcedureDto): Promise<ProcedureResponseDto> {
    const procedure = await this.createProcedureUseCase.execute({
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    });
    return ProcedureMapper.toResponseDto(procedure);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Prosedur məlumatını düzəlt (tarix/atış sayları)' })
  @ApiResponse({ status: 200, type: ProcedureResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProcedureDto,
  ): Promise<ProcedureResponseDto> {
    const procedure = await this.updateProcedureUseCase.execute(id, {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    });
    return ProcedureMapper.toResponseDto(procedure);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Prosedur qeydini sil' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteProcedureUseCase.execute(id);
  }
}
