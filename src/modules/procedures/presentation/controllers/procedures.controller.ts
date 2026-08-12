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
import { collectProcedureRelationIds } from '../../../../shared/relations/relation-name.util';
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

const PaginatedProceduresResponseDto = createPaginatedResponseDtoClass(
  ProcedureResponseDto,
  'PaginatedProceduresResponseDto',
);

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
    private readonly relationLookupService: RelationLookupService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Prosedurların siyahısı (müştəri, cihaz, zona, filial, paket, vizit, atış sayı, fərq, tarix, məbləğ filtrləri)',
  })
  @ApiResponse({ status: 200, type: PaginatedProceduresResponseDto })
  async findAll(@Query() query: ListProceduresQueryDto) {
    const result = await this.listProceduresUseCase.execute(query);
    const lookups = await this.relationLookupService.load(
      collectProcedureRelationIds(result.items),
    );
    return createPaginatedResponseDto(
      result,
      ProcedureMapper.toResponseDtoList(result.items, lookups),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə prosedur məlumatı' })
  @ApiResponse({ status: 200, type: ProcedureResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProcedureResponseDto> {
    const procedure = await this.getProcedureUseCase.execute(id);
    const lookups = await this.relationLookupService.load(
      collectProcedureRelationIds([procedure]),
    );
    return ProcedureMapper.toResponseDto(procedure, lookups);
  }

  @Post()
  @ApiOperation({
    summary:
      'Yeni vizit qeydi yarat — zona/paket seçimi və atış sayları ilə, qiymət avtomatik hesablanır. Loyallıq: hər 7-ci vizitdə (default) ən ucuz nahiyə pulsuzdur — LOYALTY_VISITS_BEFORE_FREE_ZONE ilə dəyişdirilir.',
  })
  @ApiResponse({ status: 201, type: ProcedureResponseDto })
  async create(@Body() dto: CreateProcedureDto): Promise<ProcedureResponseDto> {
    const procedure = await this.createProcedureUseCase.execute({
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    });
    const lookups = await this.relationLookupService.load(
      collectProcedureRelationIds([procedure]),
    );
    return ProcedureMapper.toResponseDto(procedure, lookups);
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
