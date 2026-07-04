import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotifyDueFollowUpsUseCase } from '../use-cases/notify-due-follow-ups.usecase';

@Injectable()
export class FollowUpDueCron {
  constructor(
    private readonly notifyDueFollowUpsUseCase: NotifyDueFollowUpsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyCheck(): Promise<void> {
    await this.notifyDueFollowUpsUseCase.execute();
  }
}
