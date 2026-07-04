import { BaseEntity } from '../../../../shared/kernel/base.entity';

export class Zone extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly name: string,
    public readonly deviceId: string,
    public readonly price: number,
  ) {
    super(id, createdAt);
  }
}
