/**
 * Base class for all domain entities. Framework-agnostic — no decorators,
 * no Supabase, no HTTP concerns allowed here or in subclasses.
 */
export abstract class BaseEntity<Id = string> {
  protected constructor(
    public readonly id: Id,
    public readonly createdAt: Date,
  ) {}
}
