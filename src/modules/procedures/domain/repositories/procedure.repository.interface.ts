import { Procedure } from '../entities/procedure.entity';

export const PROCEDURE_REPOSITORY = Symbol('IProcedureRepository');

export interface CreateProcedureData {
  customerId: string;
  deviceId: string;
  packageId: string | null;
  date: Date;
  declaredShotCount: number;
  actualShotCount: number;
  price: number;
  zoneIds: string[];
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
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IProcedureRepository {
  findAll(filters: ProcedureFilters): Promise<Procedure[]>;
  findById(id: string): Promise<Procedure | null>;
  create(data: CreateProcedureData): Promise<Procedure>;
  update(id: string, data: UpdateProcedureData): Promise<Procedure>;
  delete(id: string): Promise<void>;
}
