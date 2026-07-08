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
import { RelationLookupService } from '../../../../shared/relations/relation-lookup.service';
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications.usecase';
import { MarkNotificationAsReadUseCase } from '../../application/use-cases/mark-notification-as-read.usecase';
import { ListNotificationsQueryDto } from '../../application/dto/list-notifications-query.dto';
import { NotificationResponseDto } from '../../application/dto/notification-response.dto';
import { NotificationMapper } from '../../application/mappers/notification.mapper';

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
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  async findAll(
    @Query() query: ListNotificationsQueryDto,
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.listNotificationsUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      customerIds: notifications.map((notification) => notification.customerId),
    });
    return NotificationMapper.toResponseDtoList(notifications, lookups);
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
