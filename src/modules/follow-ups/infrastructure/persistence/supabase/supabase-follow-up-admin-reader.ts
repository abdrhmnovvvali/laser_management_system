import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import { unwrap } from '../../../../../shared/supabase/supabase-response.util';
import { FollowUp } from '../../../domain/entities/follow-up.entity';
import { FollowUpStatus } from '../../../domain/entities/follow-up-status.enum';
import { IFollowUpAdminReader } from '../../../domain/repositories/follow-up-admin-reader.interface';
import {
  FollowUpPersistenceMapper,
  FollowUpRow,
} from '../../mappers/follow-up-persistence.mapper';

const TABLE = 'follow_ups';

@Injectable()
export class SupabaseFollowUpAdminReader implements IFollowUpAdminReader {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findDueOn(date: Date): Promise<FollowUp[]> {
    const dateOnly = date.toISOString().slice(0, 10);
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('status', FollowUpStatus.PENDING)
      .eq('planned_date', dateOnly);

    const rows = unwrap<FollowUpRow[]>(response) ?? [];
    return rows.map((row) => FollowUpPersistenceMapper.toDomain(row));
  }
}
