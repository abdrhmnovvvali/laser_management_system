import { ApiProperty } from '@nestjs/swagger';
import { NotificationTranslationResponseDto } from '../../../../shared/i18n/dto/translation-response.dto';
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

  @ApiProperty({ nullable: true, description: 'Fraud bildirişi üçün prosedur ID-si' })
  procedureId: string | null;

  @ApiProperty({
    description: 'Accept-Language-ə uyğun lokalizə olunmuş mesaj',
  })
  message: string;

  @ApiProperty({ type: [NotificationTranslationResponseDto] })
  translations: NotificationTranslationResponseDto[];

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;
}
