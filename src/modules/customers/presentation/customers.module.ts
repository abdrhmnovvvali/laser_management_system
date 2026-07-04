import { Module } from '@nestjs/common';
import { BranchesModule } from '../../branches/presentation/branches.module';
import { CUSTOMER_REPOSITORY } from '../domain/repositories/customer.repository.interface';
import { SupabaseCustomerRepository } from '../infrastructure/persistence/supabase/supabase-customer.repository';
import { CustomerFacade } from '../application/customer.facade';
import { CreateCustomerUseCase } from '../application/use-cases/create-customer.usecase';
import { DeleteCustomerUseCase } from '../application/use-cases/delete-customer.usecase';
import { GetCustomerUseCase } from '../application/use-cases/get-customer.usecase';
import { ListCustomersUseCase } from '../application/use-cases/list-customers.usecase';
import { UpdateCustomerUseCase } from '../application/use-cases/update-customer.usecase';
import { CustomersController } from './controllers/customers.controller';

@Module({
  imports: [BranchesModule],
  controllers: [CustomersController],
  providers: [
    ListCustomersUseCase,
    GetCustomerUseCase,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    CustomerFacade,
    { provide: CUSTOMER_REPOSITORY, useClass: SupabaseCustomerRepository },
  ],
  exports: [CustomerFacade],
})
export class CustomersModule {}
