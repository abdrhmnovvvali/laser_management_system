import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../domain/entities/notification-type.enum';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ nullable: true })
  customerId: string | null;

  @ApiProperty({ nullable: true, description: 'Müştərinin adı soyadı' })
  customerName: string | null;

  @ApiProperty()
  message: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;
}
