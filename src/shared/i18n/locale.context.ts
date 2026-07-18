import { AsyncLocalStorage } from 'async_hooks';
import { DEFAULT_LOCALE } from './locale.constants';
import { Locale } from './locale.enum';

interface LocaleStore {
  locale: Locale;
}

const storage = new AsyncLocalStorage<LocaleStore>();

export class LocaleContext {
  static run<T>(locale: Locale, callback: () => T): T {
    return storage.run({ locale }, callback);
  }

  static getLocale(): Locale {
    return storage.getStore()?.locale ?? DEFAULT_LOCALE;
  }
}
