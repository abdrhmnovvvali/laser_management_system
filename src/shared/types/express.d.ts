import { AuthenticatedUser } from '../guards/authenticated-user.interface';
import { Locale } from '../i18n/locale.enum';

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
    locale?: Locale;
  }
}
