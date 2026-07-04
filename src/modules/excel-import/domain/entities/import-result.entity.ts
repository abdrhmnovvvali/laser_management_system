import { ImportRowError } from './import-row-error.entity';

export class ImportResult {
  constructor(
    public readonly totalRows: number,
    public readonly successCount: number,
    public readonly errors: ImportRowError[],
  ) {}

  get failedCount(): number {
    return this.errors.length;
  }
}
