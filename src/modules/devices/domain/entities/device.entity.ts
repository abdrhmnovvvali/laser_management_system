import { BaseEntity } from '../../../../shared/kernel/base.entity';

export class Device extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly branchId: string,
    public readonly type: string,
    public readonly shotCounter: number,
  ) {
    super(id, createdAt);
  }
}
