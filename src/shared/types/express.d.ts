import { AuthenticatedUser } from '../guards/authenticated-user.interface';

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}
