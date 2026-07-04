import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import { unwrap } from '../../../../../shared/supabase/supabase-response.util';
import { FraudReportItem } from '../../../domain/entities/fraud-report-item.entity';
import {
  FraudReportFilters,
  IFraudReportRepository,
} from '../../../domain/repositories/fraud-report.repository.interface';
import {
  FraudReportPersistenceMapper,
  FraudReportRow,
} from '../../mappers/fraud-report-persistence.mapper';

const VIEW = 'fraud_report_view';

@Injectable()
export class SupabaseFraudReportRepository implements IFraudReportRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findMismatches(
    filters: FraudReportFilters,
  ): Promise<FraudReportItem[]> {
    let query = this.supabase
      .from(VIEW)
      .select('*')
      .order('date', { ascending: false });

    if (filters.deviceId) {
      query = query.eq('device_id', filters.deviceId);
    }
    if (filters.branchId) {
      query = query.eq('branch_id', filters.branchId);
    }

    const response = await query;
    const rows = unwrap<FraudReportRow[]>(response) ?? [];
    return rows.map((row) => FraudReportPersistenceMapper.toDomain(row));
  }
}
