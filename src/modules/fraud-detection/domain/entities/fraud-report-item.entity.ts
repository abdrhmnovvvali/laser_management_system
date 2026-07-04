export class FraudReportItem {
  constructor(
    public readonly procedureId: string,
    public readonly customerId: string,
    public readonly deviceId: string,
    public readonly branchId: string,
    public readonly declaredShotCount: number,
    public readonly actualShotCount: number,
    public readonly date: Date,
  ) {}

  get difference(): number {
    return this.actualShotCount - this.declaredShotCount;
  }
}
