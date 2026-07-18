import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications.usecase';
import { MarkNotificationAsReadUseCase } from '../../application/use-cases/mark-notification-as-read.usecase';
import { ListNotificationsQueryDto } from '../../application/dto/list-notifications-query.dto';
import { NotificationRealtimeInfoDto } from '../../application/dto/notification-realtime-info.dto';
import { NotificationResponseDto } from '../../application/dto/notification-response.dto';
import { NotificationMapper } from '../../application/mappers/notification.mapper';
import { NOTIFICATION_CREATED_EVENT } from '../realtime/notification-realtime.constants';

const PaginatedNotificationsResponseDto = createPaginatedResponseDtoClass(
  NotificationResponseDto,
  'PaginatedNotificationsResponseDto',
);

@ApiTags('Notifications')
@ApiBearerAuth('bearerAuth')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly relationLookupService: RelationLookupService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Bildirişlərin siyahısı (oxunma/tip üzrə filtr)' })
  @ApiResponse({ status: 200, type: PaginatedNotificationsResponseDto })
  async findAll(@Query() query: ListNotificationsQueryDto) {
    const result = await this.listNotificationsUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      customerIds: result.items.map((notification) => notification.customerId),
    });
    return createPaginatedResponseDto(
      result,
      NotificationMapper.toResponseDtoList(result.items, lookups),
    );
  }

  @Get('realtime')
  @ApiOperation({
    summary:
      'Notification WebSocket (Socket.IO) bağlantı məlumatı — REST deyil, Socket.IO ilə işləyir',
  })
  @ApiResponse({ status: 200, type: NotificationRealtimeInfoDto })
  getRealtimeInfo(): NotificationRealtimeInfoDto {
    return {
      protocol: 'socket.io',
      namespace: '/notifications',
      path: '/socket.io',
      createdEvent: NOTIFICATION_CREATED_EVENT,
      auth: 'auth.token (JWT access token)',
      clientExample:
        "io('http://HOST:PORT/notifications', { path: '/socket.io', auth: { token: accessToken } })",
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Bildirişi oxunmuş kimi işarələ' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.markNotificationAsReadUseCase.execute(id);
    const lookups = await this.relationLookupService.load({
      customerIds: [notification.customerId],
    });
    return NotificationMapper.toResponseDto(notification, lookups);
  }
}
