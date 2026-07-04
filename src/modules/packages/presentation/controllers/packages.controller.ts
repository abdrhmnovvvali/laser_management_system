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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { Role } from '../../../../shared/guards/roles.enum';
import { CreatePackageUseCase } from '../../application/use-cases/create-package.usecase';
import { DeletePackageUseCase } from '../../application/use-cases/delete-package.usecase';
import { GetPackageUseCase } from '../../application/use-cases/get-package.usecase';
import { ListPackagesUseCase } from '../../application/use-cases/list-packages.usecase';
import { UpdatePackageUseCase } from '../../application/use-cases/update-package.usecase';
import { CreatePackageDto } from '../../application/dto/create-package.dto';
import { PackageResponseDto } from '../../application/dto/package-response.dto';
import { UpdatePackageDto } from '../../application/dto/update-package.dto';
import { PackageMapper } from '../../application/mappers/package.mapper';

@ApiTags('Packages')
@ApiBearerAuth('bearerAuth')
@Controller('packages')
export class PackagesController {
  constructor(
    private readonly listPackagesUseCase: ListPackagesUseCase,
    private readonly getPackageUseCase: GetPackageUseCase,
    private readonly createPackageUseCase: CreatePackageUseCase,
    private readonly updatePackageUseCase: UpdatePackageUseCase,
    private readonly deletePackageUseCase: DeletePackageUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Paketlərin siyahısı' })
  @ApiResponse({ status: 200, type: [PackageResponseDto] })
  async findAll(): Promise<PackageResponseDto[]> {
    const packages = await this.listPackagesUseCase.execute();
    return PackageMapper.toResponseDtoList(packages);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə paket məlumatı' })
  @ApiResponse({ status: 200, type: PackageResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PackageResponseDto> {
    const pkg = await this.getPackageUseCase.execute(id);
    return PackageMapper.toResponseDto(pkg);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Yeni paket yarat (yalnız admin)' })
  @ApiResponse({ status: 201, type: PackageResponseDto })
  async create(@Body() dto: CreatePackageDto): Promise<PackageResponseDto> {
    const pkg = await this.createPackageUseCase.execute(dto);
    return PackageMapper.toResponseDto(pkg);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Paketi yenilə (yalnız admin)' })
  @ApiResponse({ status: 200, type: PackageResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePackageDto,
  ): Promise<PackageResponseDto> {
    const pkg = await this.updatePackageUseCase.execute(id, dto);
    return PackageMapper.toResponseDto(pkg);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Paketi sil (yalnız admin)' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deletePackageUseCase.execute(id);
  }
}
