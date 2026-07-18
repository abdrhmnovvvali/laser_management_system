import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  createPaginatedResponseDto,
  createPaginatedResponseDtoClass,
} from '../../../../shared/dto/paginated-response.dto';
import { RelationLookupService } from '../../../../shared/relations/relation-lookup.service';
import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.usecase';
import { DeleteCustomerUseCase } from '../../application/use-cases/delete-customer.usecase';
import { GetCustomerUseCase } from '../../application/use-cases/get-customer.usecase';
import { ListCustomersUseCase } from '../../application/use-cases/list-customers.usecase';
import { UpdateCustomerUseCase } from '../../application/use-cases/update-customer.usecase';
import { CreateCustomerDto } from '../../application/dto/create-customer.dto';
import { CustomerResponseDto } from '../../application/dto/customer-response.dto';
import { ListCustomersQueryDto } from '../../application/dto/list-customers-query.dto';
import { UpdateCustomerDto } from '../../application/dto/update-customer.dto';
import { CustomerMapper } from '../../application/mappers/customer.mapper';

const PaginatedCustomersResponseDto = createPaginatedResponseDtoClass(
  CustomerResponseDto,
  'PaginatedCustomersResponseDto',
);

@ApiTags('Customers')
@ApiBearerAuth('bearerAuth')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly getCustomerUseCase: GetCustomerUseCase,
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly relationLookupService: RelationLookupService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Müştərilərin siyahısı (filial/cins/nahiyə/axtarış üzrə filtr)',
  })
  @ApiResponse({ status: 200, type: PaginatedCustomersResponseDto })
  async findAll(@Query() query: ListCustomersQueryDto) {
    const result = await this.listCustomersUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      branchIds: result.items.map((customer) => customer.branchId),
    });
    return createPaginatedResponseDto(
      result,
      CustomerMapper.toResponseDtoList(result.items, lookups),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə müştəri məlumatı' })
  @ApiResponse({ status: 200, type: CustomerResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CustomerResponseDto> {
    const customer = await this.getCustomerUseCase.execute(id);
    const lookups = await this.relationLookupService.load({
      branchIds: [customer.branchId],
    });
    return CustomerMapper.toResponseDto(customer, lookups);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni müştəri qeydiyyata al' })
  @ApiResponse({ status: 201, type: CustomerResponseDto })
  async create(@Body() dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.createCustomerUseCase.execute({
      ...dto,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
    });
    return CustomerMapper.toResponseDto(customer);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Müştəri məlumatını yenilə' })
  @ApiResponse({ status: 200, type: CustomerResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.updateCustomerUseCase.execute(id, {
      ...dto,
      birthDate:
        dto.birthDate !== undefined
          ? dto.birthDate
            ? new Date(dto.birthDate)
            : null
          : undefined,
    });
    return CustomerMapper.toResponseDto(customer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Müştərini sil' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteCustomerUseCase.execute(id);
  }
}
