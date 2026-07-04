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
import { CreateNoteUseCase } from '../../application/use-cases/create-note.usecase';
import { DeleteNoteUseCase } from '../../application/use-cases/delete-note.usecase';
import { GetNoteUseCase } from '../../application/use-cases/get-note.usecase';
import { ListNotesByCustomerUseCase } from '../../application/use-cases/list-notes-by-customer.usecase';
import { UpdateNoteUseCase } from '../../application/use-cases/update-note.usecase';
import { CreateNoteDto } from '../../application/dto/create-note.dto';
import { NoteResponseDto } from '../../application/dto/note-response.dto';
import { UpdateNoteDto } from '../../application/dto/update-note.dto';
import { NoteMapper } from '../../application/mappers/note.mapper';

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
  ) {}

  @Get()
  @ApiQuery({ name: 'customerId', required: true })
  @ApiOperation({ summary: 'Müştərinin kommunikasiya qeydlərinin siyahısı' })
  @ApiResponse({ status: 200, type: [NoteResponseDto] })
  async findAllByCustomer(
    @Query('customerId', ParseUUIDPipe) customerId: string,
  ): Promise<NoteResponseDto[]> {
    const notes = await this.listNotesByCustomerUseCase.execute(customerId);
    return NoteMapper.toResponseDtoList(notes);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə qeyd məlumatı' })
  @ApiResponse({ status: 200, type: NoteResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteResponseDto> {
    const note = await this.getNoteUseCase.execute(id);
    return NoteMapper.toResponseDto(note);
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
