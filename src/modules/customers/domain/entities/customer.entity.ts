import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { Gender } from './gender.enum';

export class Customer extends BaseEntity<string> {
  constructor(
    id: string,
    public readonly registeredAt: Date,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: string | null,
    public readonly birthDate: Date | null,
    public readonly gender: Gender | null,
    public readonly branchId: string,
    public readonly visitCount: number = 0,
  ) {
    super(id, registeredAt);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
