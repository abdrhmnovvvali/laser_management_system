import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthenticatedUser } from '../../../../shared/guards/authenticated-user.interface';
import { Role } from '../../../../shared/guards/roles.enum';
import { NotificationResponseDto } from '../../application/dto/notification-response.dto';
import {
  NOTIFICATION_CREATED_EVENT,
  NOTIFICATIONS_ADMIN_ROOM,
  notificationsBranchRoom,
} from './notification-realtime.constants';
import { NotificationWsAuthService } from './notification-ws-auth.service';

@WebSocketGateway({
  namespace: '/notifications',
  path: '/socket.io',
  cors: {
    origin: true,
    credentials: true,
  },
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly authService: NotificationWsAuthService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = await this.authService.authenticate(client);
      client.data.user = user;
      this.joinUserRooms(client, user);
      this.logger.log(`WS connected: ${user.email ?? user.id}`);
      client.emit('connected', {
        ok: true,
        userId: user.id,
        role: user.role,
        branchId: user.branchId,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unauthorized websocket';
      this.logger.warn(`WS auth failed (${client.id}): ${message}`);
      client.emit('exception', { message });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`WS disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload?: unknown,
  ): { event: string; data: { ok: true; at: string; echo: unknown } } {
    return {
      event: 'pong',
      data: {
        ok: true,
        at: new Date().toISOString(),
        echo: payload ?? null,
      },
    };
  }

  emitCreated(
    notification: NotificationResponseDto,
    branchId: string | null,
  ): void {
    if (!this.server) {
      this.logger.warn('WS server hazır deyil — notification emit atlandı');
      return;
    }

    this.server
      .to(NOTIFICATIONS_ADMIN_ROOM)
      .emit(NOTIFICATION_CREATED_EVENT, notification);

    if (branchId) {
      this.server
        .to(notificationsBranchRoom(branchId))
        .emit(NOTIFICATION_CREATED_EVENT, notification);
    }
  }

  private joinUserRooms(client: Socket, user: AuthenticatedUser): void {
    if (user.role === Role.ADMIN) {
      void client.join(NOTIFICATIONS_ADMIN_ROOM);
      return;
    }

    if (user.branchId) {
      void client.join(notificationsBranchRoom(user.branchId));
    }
  }
}
