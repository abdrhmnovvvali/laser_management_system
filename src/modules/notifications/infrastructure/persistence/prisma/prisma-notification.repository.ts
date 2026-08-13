import { Injectable } from '@nestjs/common';
import {
  Locale as PrismaLocale,
  NotificationType as PrismaNotificationType,
  Prisma,
} from '@prisma/client';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { Notification } from '../../../domain/entities/notification.entity';
import {
  INotificationRepository,
  NotificationFilters,
} from '../../../domain/repositories/notification.repository.interface';
import { Locale } from '../../../../../shared/i18n/locale.enum';
import { NotificationType } from '../../../domain/entities/notification-type.enum';
import { NotificationPersistenceMapper } from '../../mappers/notification-persistence.mapper';

const translationsInclude = {
  translations: true,
} as const;

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    filters: NotificationFilters,
  ): Promise<PaginatedResult<Notification>> {
    const { skip, take } = toPrismaSkipTake(filters.pagination);
    const where: Prisma.NotificationWhereInput = {};
    if (filters.isRead !== undefined) where.isRead = filters.isRead;
    if (filters.type) {
      where.type = filters.type as PrismaNotificationType;
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        include: translationsInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      filters.pagination,
    );
  }

  async findById(id: string): Promise<Notification | null> {
    const row = await this.prisma.notification.findUnique({
      where: { id },
      include: translationsInclude,
    });
    return row ? this.toDomain(row) : null;
  }

  async markAsRead(id: string): Promise<Notification> {
    const row = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
      include: translationsInclude,
    });
    return this.toDomain(row);
  }

  private toDomain(row: {
    id: string;
    type: PrismaNotificationType;
    customerId: string | null;
    procedureId: string | null;
    isRead: boolean;
    createdAt: Date;
    translations: Array<{ locale: PrismaLocale; message: string }>;
  }): Notification {
    return NotificationPersistenceMapper.toDomain({
      id: row.id,
      type: row.type as NotificationType,
      customer_id: row.customerId,
      procedure_id: row.procedureId,
      is_read: row.isRead,
      created_at: row.createdAt.toISOString(),
      notification_translations: row.translations.map((item) => ({
        locale: item.locale as Locale,
        message: item.message,
      })),
    });
  }
}
