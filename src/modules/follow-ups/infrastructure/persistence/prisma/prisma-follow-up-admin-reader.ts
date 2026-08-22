import { Injectable } from '@nestjs/common';
import { FollowUpStatus as PrismaFollowUpStatus } from '@prisma/client';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { FollowUp } from '../../../domain/entities/follow-up.entity';
import { FollowUpStatus } from '../../../domain/entities/follow-up-status.enum';
import { IFollowUpAdminReader } from '../../../domain/repositories/follow-up-admin-reader.interface';
import { FollowUpPersistenceMapper } from '../../mappers/follow-up-persistence.mapper';

function toDateOnly(date: Date): Date {
  return new Date(date.toISOString().slice(0, 10));
}

@Injectable()
export class PrismaFollowUpAdminReader implements IFollowUpAdminReader {
  constructor(private readonly prisma: PrismaService) {}

  async findDueOn(date: Date): Promise<FollowUp[]> {
    const rows = await this.prisma.followUp.findMany({
      where: {
        status: FollowUpStatus.PENDING as PrismaFollowUpStatus,
        plannedDate: toDateOnly(date),
      },
      include: { zones: true },
    });

    return rows.map((row) =>
      FollowUpPersistenceMapper.toDomain({
        id: row.id,
        customer_id: row.customerId,
        device_id: row.deviceId,
        planned_date: row.plannedDate.toISOString(),
        planned_time: row.plannedTime,
        status: row.status as FollowUpStatus,
        created_at: row.createdAt.toISOString(),
        follow_up_zones: row.zones.map((item) => ({ zone_id: item.zoneId })),
      }),
    );
  }
}
