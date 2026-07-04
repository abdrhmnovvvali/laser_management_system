/**
 * Base class for all domain-level errors. Presentation layer maps these
 * to HTTP exceptions (see shared/filters) — domain never throws Nest's
 * HttpException directly.
 */
export abstract class DomainException extends Error {
  protected constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} not found (id: ${id})`, 'ENTITY_NOT_FOUND');
  }
}

export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class BusinessRuleViolationException extends DomainException {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION');
  }
}

export class UnauthorizedDomainException extends DomainException {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
  }
}
