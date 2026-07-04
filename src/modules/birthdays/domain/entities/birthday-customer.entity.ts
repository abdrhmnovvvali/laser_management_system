export class BirthdayCustomer {
  constructor(
    public readonly customerId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly branchId: string,
    public readonly birthDate: Date,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
