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
import { CreateNoteUseCase } from '../../application/use-cases/create-note.usecase';
import { DeleteNoteUseCase } from '../../application/use-cases/delete-note.usecase';
import { GetNoteUseCase } from '../../application/use-cases/get-note.usecase';
import { ListNotesByCustomerUseCase } from '../../application/use-cases/list-notes-by-customer.usecase';
import { UpdateNoteUseCase } from '../../application/use-cases/update-note.usecase';
import { CreateNoteDto } from '../../application/dto/create-note.dto';
import { ListNotesQueryDto } from '../../application/dto/list-notes-query.dto';
import { NoteResponseDto } from '../../application/dto/note-response.dto';
import { UpdateNoteDto } from '../../application/dto/update-note.dto';
import { NoteMapper } from '../../application/mappers/note.mapper';

const PaginatedNotesResponseDto = createPaginatedResponseDtoClass(
  NoteResponseDto,
  'PaginatedNotesResponseDto',
);

@ApiTags('Communication (Notes)')
@ApiBearerAuth('bearerAuth')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly listNotesByCustomerUseCase: ListNotesByCustomerUseCase,
    private readonly getNoteUseCase: GetNoteUseCase,
    private readonly createNoteUseCase: CreateNoteUseCase,
    private readonly updateNoteUseCase: UpdateNoteUseCase,
    private readonly deleteNoteUseCase: DeleteNoteUseCase,
    private readonly relationLookupService: RelationLookupService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Müştərinin kommunikasiya qeydlərinin siyahısı' })
  @ApiResponse({ status: 200, type: PaginatedNotesResponseDto })
  async findAllByCustomer(@Query() query: ListNotesQueryDto) {
    const result = await this.listNotesByCustomerUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      customerIds: result.items.map((note) => note.customerId),
    });
    return createPaginatedResponseDto(
      result,
      NoteMapper.toResponseDtoList(result.items, lookups),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə qeyd məlumatı' })
  @ApiResponse({ status: 200, type: NoteResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteResponseDto> {
    const note = await this.getNoteUseCase.execute(id);
    const lookups = await this.relationLookupService.load({
      customerIds: [note.customerId],
    });
    return NoteMapper.toResponseDto(note, lookups);
  }

  @Post()
  @ApiOperation({
    summary: 'Yeni kommunikasiya qeydi əlavə et (zəng/sosial/üz-üzə)',
  })
  @ApiResponse({ status: 201, type: NoteResponseDto })
  async create(@Body() dto: CreateNoteDto): Promise<NoteResponseDto> {
    const note = await this.createNoteUseCase.execute(dto);
    return NoteMapper.toResponseDto(note);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Qeydi yenilə' })
  @ApiResponse({ status: 200, type: NoteResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    const note = await this.updateNoteUseCase.execute(id, dto);
    return NoteMapper.toResponseDto(note);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Qeydi sil' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteNoteUseCase.execute(id);
  }
}
