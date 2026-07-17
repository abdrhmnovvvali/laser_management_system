import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LocaleMiddleware } from './locale.middleware';

@Module({})
export class I18nModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LocaleMiddleware).forRoutes('*');
  }
}
