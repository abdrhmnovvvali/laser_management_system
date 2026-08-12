import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { Procedure } from '../entities/procedure.entity';

export const PROCEDURE_REPOSITORY = Symbol('IProcedureRepository');

export interface CreateProcedureData {
  customerId: string;
  deviceId: string;
  packageId: string | null;
  campaignId?: string | null;
  date: Date;
  declaredShotCount: number;
  actualShotCount: number;
  price: number;
  zoneIds: string[];
  freeZoneId?: string | null;
  discountAmount?: number;
  visitNumber?: number | null;
}

export interface UpdateProcedureData {
  date?: Date;
  declaredShotCount?: number;
  actualShotCount?: number;
}

export interface ProcedureFilters {
  customerId?: string;
  deviceId?: string;
  branchId?: string;
  packageId?: string;
  campaignId?: string;
  visitNumber?: number;
  declaredShotCount?: number;
  actualShotCount?: number;
  difference?: number;
  dateFrom?: Date;
  dateTo?: Date;
  minPrice?: number;
  maxPrice?: number;
  zoneIds?: string[];
  pagination?: PaginationParams;
}

export interface IProcedureRepository {
  findAll(filters: ProcedureFilters): Promise<PaginatedResult<Procedure>>;
  findById(id: string): Promise<Procedure | null>;
  countByCustomerId(customerId: string): Promise<number>;
  create(data: CreateProcedureData): Promise<Procedure>;
  update(id: string, data: UpdateProcedureData): Promise<Procedure>;
  delete(id: string): Promise<void>;
}
