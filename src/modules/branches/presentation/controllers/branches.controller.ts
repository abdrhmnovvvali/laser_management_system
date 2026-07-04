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
import { CreateBranchUseCase } from '../../application/use-cases/create-branch.usecase';
import { DeleteBranchUseCase } from '../../application/use-cases/delete-branch.usecase';
import { GetBranchUseCase } from '../../application/use-cases/get-branch.usecase';
import { ListBranchesUseCase } from '../../application/use-cases/list-branches.usecase';
import { UpdateBranchUseCase } from '../../application/use-cases/update-branch.usecase';
import { BranchResponseDto } from '../../application/dto/branch-response.dto';
import { CreateBranchDto } from '../../application/dto/create-branch.dto';
import { UpdateBranchDto } from '../../application/dto/update-branch.dto';
import { BranchMapper } from '../../application/mappers/branch.mapper';

@ApiTags('Branches')
@ApiBearerAuth('bearerAuth')
@Controller('branches')
export class BranchesController {
  constructor(
    private readonly listBranchesUseCase: ListBranchesUseCase,
    private readonly getBranchUseCase: GetBranchUseCase,
    private readonly createBranchUseCase: CreateBranchUseCase,
    private readonly updateBranchUseCase: UpdateBranchUseCase,
    private readonly deleteBranchUseCase: DeleteBranchUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Bütün filialların siyahısı' })
  @ApiResponse({ status: 200, type: [BranchResponseDto] })
  async findAll(): Promise<BranchResponseDto[]> {
    const branches = await this.listBranchesUseCase.execute();
    return BranchMapper.toResponseDtoList(branches);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID üzrə filial məlumatı' })
  @ApiResponse({ status: 200, type: BranchResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BranchResponseDto> {
    const branch = await this.getBranchUseCase.execute(id);
    return BranchMapper.toResponseDto(branch);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Yeni filial yarat (yalnız admin)' })
  @ApiResponse({ status: 201, type: BranchResponseDto })
  async create(@Body() dto: CreateBranchDto): Promise<BranchResponseDto> {
    const branch = await this.createBranchUseCase.execute(dto);
    return BranchMapper.toResponseDto(branch);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Filialı yenilə (yalnız admin)' })
  @ApiResponse({ status: 200, type: BranchResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    const branch = await this.updateBranchUseCase.execute(id, dto);
    return BranchMapper.toResponseDto(branch);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Filialı sil (yalnız admin)' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteBranchUseCase.execute(id);
  }
}
