import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  BusinessRuleViolationException,
  DomainException,
  EntityNotFoundException,
  UnauthorizedDomainException,
  ValidationException,
} from '../kernel/domain.exception';

/**
 * Translates domain exceptions (thrown by use-cases) into HTTP responses.
 * Keeps the domain/application layer free of HTTP status codes.
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.mapToHttpStatus(exception);

    this.logger.warn(`${exception.code}: ${exception.message}`);

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
    });
  }

  private mapToHttpStatus(exception: DomainException): number {
    if (exception instanceof EntityNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof ValidationException) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof BusinessRuleViolationException) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }
    if (exception instanceof UnauthorizedDomainException) {
      return HttpStatus.FORBIDDEN;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
