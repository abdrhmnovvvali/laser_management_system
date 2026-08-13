import { Injectable, Logger } from '@nestjs/common';
import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../shared/relations/relation-lookups.interface';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { Notification } from '../domain/entities/notification.entity';
import { NotificationsGateway } from '../presentation/realtime/notifications.gateway';
import { NotificationMapper } from './mappers/notification.mapper';

@Injectable()
export class NotificationRealtimeService {
  private readonly logger = new Logger(NotificationRealtimeService.name);

  constructor(
    private readonly gateway: NotificationsGateway,
    private readonly prisma: PrismaService,
  ) {}

  async broadcastCreated(notification: Notification): Promise<void> {
    try {
      const { branchId, lookups } = await this.resolveCustomerContext(
        notification.customerId,
      );
      const payload = NotificationMapper.toResponseDto(notification, lookups);
      this.gateway.emitCreated(payload, branchId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'unknown broadcast error';
      this.logger.error(
        `Notification WS broadcast uğursuz oldu (${notification.id}): ${message}`,
      );
    }
  }

  private async resolveCustomerContext(customerId: string | null): Promise<{
    branchId: string | null;
    lookups: RelationLookups;
  }> {
    if (!customerId) {
      return { branchId: null, lookups: EMPTY_RELATION_LOOKUPS };
    }

    const row = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        branchId: true,
      },
    });

    if (!row) {
      return { branchId: null, lookups: EMPTY_RELATION_LOOKUPS };
    }

    return {
      branchId: row.branchId,
      lookups: {
        ...EMPTY_RELATION_LOOKUPS,
        customers: new Map([
          [row.id, `${row.firstName} ${row.lastName}`.trim()],
        ]),
      },
    };
  }
}
