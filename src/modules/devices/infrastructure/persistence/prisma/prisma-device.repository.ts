import { Injectable } from '@nestjs/common';
import { Locale as PrismaLocale, Prisma } from '@prisma/client';
import { BusinessRuleViolationException } from '../../../../../shared/kernel/domain.exception';
import { createPaginatedResult } from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { Device } from '../../../domain/entities/device.entity';
import {
  CreateDeviceData,
  DeviceListOptions,
  DeviceTranslationInput,
  IDeviceRepository,
  UpdateDeviceData,
} from '../../../domain/repositories/device.repository.interface';
import { Locale } from '../../../../../shared/i18n/locale.enum';
import { DevicePersistenceMapper } from '../../mappers/device-persistence.mapper';

const translationsInclude = {
  translations: true,
} as const;

@Injectable()
export class PrismaDeviceRepository implements IDeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: DeviceListOptions): Promise<PaginatedResult<Device>> {
    const { skip, take } = toPrismaSkipTake(options?.pagination);
    const where: Prisma.DeviceWhereInput = options?.branchId
      ? { branchId: options.branchId }
      : {};

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.device.findMany({
        where,
        include: translationsInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.device.count({ where }),
    ]);

    return createPaginatedResult(
      rows.map((row) => this.toDomain(row)),
      total,
      options?.pagination,
    );
  }

  async findById(id: string): Promise<Device | null> {
    const row = await this.prisma.device.findUnique({
      where: { id },
      include: translationsInclude,
    });
    return row ? this.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Device[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.prisma.device.findMany({
      where: { id: { in: ids } },
      include: translationsInclude,
    });
    return rows.map((row) => this.toDomain(row));
  }

  async create(data: CreateDeviceData): Promise<Device> {
    const created = await this.prisma.device.create({
      data: {
        branchId: data.branchId,
        shotCounter: data.shotCounter ?? 0,
        translations: {
          create: data.translations.map((item) => ({
            locale: item.locale as PrismaLocale,
            type: item.type,
          })),
        },
      },
      include: translationsInclude,
    });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateDeviceData): Promise<Device> {
    if (data.shotCounter !== undefined) {
      await this.prisma.device.update({
        where: { id },
        data: { shotCounter: data.shotCounter },
      });
    }

    if (data.translations) {
      await this.replaceTranslations(id, data.translations);
    }

    const device = await this.findById(id);
    if (!device) {
      throw new Error('Device update sonrası tapılmadı');
    }
    return device;
  }

  async incrementShotCounter(id: string, byAmount: number): Promise<Device> {
    await this.prisma.$queryRaw`
      SELECT * FROM increment_device_shot_counter(${id}::uuid, ${byAmount}::int)
    `;

    const device = await this.findById(id);
    if (!device) {
      throw new Error('Device shot counter yeniləmə sonrası tapılmadı');
    }
    return device;
  }

  async delete(id: string): Promise<void> {
    // 1. Cihaza bağlı prosedurların yoxlanılması
    const proceduresCount = await this.prisma.procedure.count({
      where: { deviceId: id },
    });
    if (proceduresCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu cihaza bağlı prosedurlar mövcuddur. Əvvəlcə həmin prosedurları tənzimləyin və ya silin.',
      );
    }

    // 2. Cihaza bağlı rezervasiyaların yoxlanılması
    const followUpsCount = await this.prisma.followUp.count({
      where: { deviceId: id },
    });
    if (followUpsCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu cihaza bağlı aktiv rezervasiyalar mövcuddur. Əvvəlcə həmin rezervasiyaları tənzimləyin və ya silin.',
      );
    }

    // 3. Cihazın zonalarının prosedurlarda istifadə edilməsinin yoxlanılması
    const procedureZonesCount = await this.prisma.procedureZone.count({
      where: { zone: { deviceId: id } },
    });
    if (procedureZonesCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu cihaza aid zonalar prosedurlarda istifadə edildiyi üçün cihaz silinə bilməz.',
      );
    }

    // 4. Cihazın zonalarının kampaniyalarda istifadə edilməsinin yoxlanılması
    const campaignZonesCount = await this.prisma.campaignZone.count({
      where: { zone: { deviceId: id } },
    });
    if (campaignZonesCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu cihaza aid zonalar kampaniyalarda istifadə edildiyi üçün cihaz silinə bilməz.',
      );
    }

    // 5. Cihazın zonalarının rezervasiyalarda istifadə edilməsinin yoxlanılması
    const followUpZonesCount = await this.prisma.followUpZone.count({
      where: { zone: { deviceId: id } },
    });
    if (followUpZonesCount > 0) {
      throw new BusinessRuleViolationException(
        'Bu cihaza aid zonalar rezervasiyalarda istifadə edildiyi üçün cihaz silinə bilməz.',
      );
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // Cihazın zonalarını tapırıq
        const deviceZones = await tx.zone.findMany({
          where: { deviceId: id },
          select: { id: true },
        });
        const zoneIds = deviceZones.map((z) => z.id);

        if (zoneIds.length > 0) {
          await tx.packageZone.deleteMany({
            where: { zoneId: { in: zoneIds } },
          });
          await tx.zoneTranslation.deleteMany({
            where: { zoneId: { in: zoneIds } },
          });
          await tx.zone.deleteMany({
            where: { deviceId: id },
          });
        }

        await tx.deviceTranslation.deleteMany({
          where: { deviceId: id },
        });

        await tx.device.delete({
          where: { id },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BusinessRuleViolationException(
          'Bu cihaz digər qeydlərə bağlı olduğu üçün silinə bilməz.',
        );
      }
      throw error;
    }
  }

  private async replaceTranslations(
    deviceId: string,
    translations: DeviceTranslationInput[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.deviceTranslation.deleteMany({ where: { deviceId } }),
      this.prisma.deviceTranslation.createMany({
        data: translations.map((item) => ({
          deviceId,
          locale: item.locale as PrismaLocale,
          type: item.type,
        })),
      }),
    ]);
  }

  private toDomain(row: {
    id: string;
    branchId: string;
    shotCounter: bigint;
    createdAt: Date;
    translations: Array<{ locale: PrismaLocale; type: string }>;
  }): Device {
    return DevicePersistenceMapper.toDomain({
      id: row.id,
      branch_id: row.branchId,
      shot_counter: Number(row.shotCounter),
      created_at: row.createdAt.toISOString(),
      device_translations: row.translations.map((item) => ({
        locale: item.locale as Locale,
        type: item.type,
      })),
    });
  }
}
