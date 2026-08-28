import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Last-resort catch-all filter. Ensures no unhandled exception ever leaks
 * stack traces to the client and every error response has a consistent shape.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2003') {
        response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          code: 'BUSINESS_RULE_VIOLATION',
          message:
            'Bu qeyd digər məlumatlara (prosedurlar, rezervasiyalar və s.) bağlı olduğu üçün əməliyyat icra edilə bilməz.',
        });
        return;
      }
      if (exception.code === 'P2025') {
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          code: 'ENTITY_NOT_FOUND',
          message: 'Axtarılan məlumat tapılmadı.',
        });
        return;
      }
    }

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    if (!isHttpException) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(status).json({
      statusCode: status,
      ...(typeof message === 'string' ? { message } : message),
    });
  }
}
