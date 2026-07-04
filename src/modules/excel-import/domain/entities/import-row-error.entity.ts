export class ImportRowError {
  constructor(
    public readonly row: number,
    public readonly message: string,
  ) {}
}
