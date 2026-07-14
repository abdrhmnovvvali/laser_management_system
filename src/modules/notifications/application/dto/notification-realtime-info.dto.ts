import { ApiProperty } from '@nestjs/swagger';

export class NotificationRealtimeInfoDto {
  @ApiProperty({ example: 'socket.io' })
  protocol: string;

  @ApiProperty({
    example: '/notifications',
    description: 'Socket.IO namespace',
  })
  namespace: string;

  @ApiProperty({
    example: '/socket.io',
    description: 'Socket.IO engine path',
  })
  path: string;

  @ApiProperty({
    example: 'notification.created',
    description: 'Serverin emit etdiyi event adı',
  })
  createdEvent: string;

  @ApiProperty({
    example: 'auth.token',
    description: 'JWT token harada göndərilməlidir',
  })
  auth: string;

  @ApiProperty({
    example:
      "io('http://localhost:3000/notifications', { auth: { token: accessToken } })",
  })
  clientExample: string;
}
