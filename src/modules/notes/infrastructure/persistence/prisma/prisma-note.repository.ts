import { Injectable } from '@nestjs/common';
import { NoteType as PrismaNoteType, Prisma } from '@prisma/client';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { Note } from '../../../domain/entities/note.entity';
import {
  CreateNoteData,
  INoteRepository,
  NoteListOptions,
  UpdateNoteData,
} from '../../../domain/repositories/note.repository.interface';
import { NoteType } from '../../../domain/entities/note-type.enum';
import { NotePersistenceMapper } from '../../mappers/note-persistence.mapper';

@Injectable()
export class PrismaNoteRepository implements INoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: NoteListOptions): Promise<PaginatedResult<Note>> {
    const { skip, take } = toPrismaSkipTake(options.pagination);
    const where: Prisma.NoteWhereInput = {};
    if (options.customerId) where.customerId = options.customerId;
    if (options.type) where.type = options.type as PrismaNoteType;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.note.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.note.count({ where }),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      options.pagination,
    );
  }

  async findById(id: string): Promise<Note | null> {
    const row = await this.prisma.note.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateNoteData): Promise<Note> {
    const row = await this.prisma.note.create({
      data: {
        customerId: data.customerId,
        type: data.type as PrismaNoteType,
        content: data.content,
        outcome: data.outcome ?? null,
      },
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateNoteData): Promise<Note> {
    const payload: Prisma.NoteUpdateInput = {};
    if (data.type !== undefined) payload.type = data.type as PrismaNoteType;
    if (data.content !== undefined) payload.content = data.content;
    if (data.outcome !== undefined) payload.outcome = data.outcome;

    const row = await this.prisma.note.update({
      where: { id },
      data: payload,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.note.delete({ where: { id } });
  }

  private toDomain(row: {
    id: string;
    customerId: string;
    type: PrismaNoteType;
    content: string;
    outcome: string | null;
    createdAt: Date;
  }): Note {
    return NotePersistenceMapper.toDomain({
      id: row.id,
      customer_id: row.customerId,
      type: row.type as NoteType,
      content: row.content,
      outcome: row.outcome,
      created_at: row.createdAt.toISOString(),
    });
  }
}
