import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotifyTodaysBirthdaysUseCase } from '../use-cases/notify-todays-birthdays.usecase';

@Injectable()
export class BirthdayCheckCron {
  constructor(
    private readonly notifyTodaysBirthdaysUseCase: NotifyTodaysBirthdaysUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async handleDailyCheck(): Promise<void> {
    await this.notifyTodaysBirthdaysUseCase.execute();
  }
}
