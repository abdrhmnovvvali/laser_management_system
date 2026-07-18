import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { DEFAULT_LOCALE, isSupportedLocale } from './locale.constants';
import { LocaleContext } from './locale.context';
import { Locale } from './locale.enum';

function parseAcceptLanguage(header: string | undefined): Locale {
  if (!header) {
    return DEFAULT_LOCALE;
  }

  const candidates = header
    .split(',')
    .map((part) => part.trim().split(';')[0]?.trim().toLowerCase())
    .filter((part): part is string => Boolean(part));

  for (const candidate of candidates) {
    const primary = candidate.split('-')[0];
    if (primary && isSupportedLocale(primary)) {
      return primary;
    }
  }

  return DEFAULT_LOCALE;
}

@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const locale = parseAcceptLanguage(req.headers['accept-language']);
    req.locale = locale;
    LocaleContext.run(locale, () => next());
  }
}
