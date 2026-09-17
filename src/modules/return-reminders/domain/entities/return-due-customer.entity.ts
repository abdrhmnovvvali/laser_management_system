/**
 * Son viziti müəyyən gün əvvəl olan — yəni yenidən lazerə gəlmə vaxtı çatmış müştəri.
 */
export class ReturnDueCustomer {
  constructor(
    public readonly customerId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: string | null,
    public readonly branchId: string,
    public readonly lastVisitAt: Date,
    public readonly daysSinceLastVisit: number,
    public readonly visitCount: number,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
