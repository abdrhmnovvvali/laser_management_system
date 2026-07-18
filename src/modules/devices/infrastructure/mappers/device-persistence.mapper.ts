import { LocaleContext } from '../../../../shared/i18n/locale.context';
import { Locale } from '../../../../shared/i18n/locale.enum';
import { pickLocalizedField } from '../../../../shared/i18n/translation.util';
import {
  Device,
  DeviceTranslation,
} from '../../domain/entities/device.entity';

export interface DeviceTranslationRow {
  locale: Locale;
  type: string;
}

export interface DeviceRow {
  id: string;
  branch_id: string;
  shot_counter: number;
  created_at: string;
  device_translations?: DeviceTranslationRow[] | null;
}

export class DevicePersistenceMapper {
  static toDomain(row: DeviceRow): Device {
    const translations: DeviceTranslation[] = (
      row.device_translations ?? []
    ).map((item) => ({
      locale: item.locale,
      type: item.type,
    }));

    return new Device(
      row.id,
      new Date(row.created_at),
      row.branch_id,
      pickLocalizedField(
        translations,
        LocaleContext.getLocale(),
        (item) => item.type,
        '',
      ) ?? '',
      Number(row.shot_counter),
      translations,
    );
  }
}
