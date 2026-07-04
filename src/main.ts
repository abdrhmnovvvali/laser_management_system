import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors();

  const swaggerPath = configService.get<string>('swagger.path')!;
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Lazer Epilyasiya Mərkəzi API')
    .setDescription(
      'Filial, cihaz, müştəri, prosedur, kampaniya və bildiriş idarəetməsi üçün backend API',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearerAuth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, document);

  const port = configService.get<number>('app.port')!;
  await app.listen(port);
}

void bootstrap();
