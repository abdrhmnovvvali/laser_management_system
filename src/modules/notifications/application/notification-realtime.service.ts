import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../shared/relations/relation-lookups.interface';
import { SUPABASE_ADMIN_CLIENT } from '../../../shared/supabase/supabase.constants';
import { unwrap } from '../../../shared/supabase/supabase-response.util';
import { Notification } from '../domain/entities/notification.entity';
import { NotificationsGateway } from '../presentation/realtime/notifications.gateway';
import { NotificationMapper } from './mappers/notification.mapper';

interface CustomerBranchRow {
  id: string;
  first_name: string;
  last_name: string;
  branch_id: string;
}

@Injectable()
export class NotificationRealtimeService {
  private readonly logger = new Logger(NotificationRealtimeService.name);

  constructor(
    private readonly gateway: NotificationsGateway,
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdmin: SupabaseClient,
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

    const response = await this.supabaseAdmin
      .from('customers')
      .select('id, first_name, last_name, branch_id')
      .eq('id', customerId)
      .maybeSingle();

    const row = unwrap<CustomerBranchRow>(response);
    if (!row) {
      return { branchId: null, lookups: EMPTY_RELATION_LOOKUPS };
    }

    return {
      branchId: row.branch_id,
      lookups: {
        ...EMPTY_RELATION_LOOKUPS,
        customers: new Map([
          [row.id, `${row.first_name} ${row.last_name}`.trim()],
        ]),
      },
    };
  }
}
