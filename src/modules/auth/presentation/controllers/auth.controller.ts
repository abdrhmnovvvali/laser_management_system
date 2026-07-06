import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../../../../shared/decorators/public.decorator';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../../shared/guards/authenticated-user.interface';
import { Role } from '../../../../shared/guards/roles.enum';
import { BranchFacade } from '../../../branches/application/branch.facade';
import { CreateStaffUserUseCase } from '../../application/use-cases/create-staff-user.usecase';
import { DeleteStaffUserUseCase } from '../../application/use-cases/delete-staff-user.usecase';
import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { CreateStaffUserDto } from '../../application/dto/create-staff-user.dto';
import { CurrentUserResponseDto } from '../../application/dto/current-user-response.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { LoginResponseDto } from '../../application/dto/login-response.dto';
import { StaffUserResponseDto } from '../../application/dto/staff-user-response.dto';
import { AuthMapper } from '../../application/mappers/auth.mapper';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly createStaffUserUseCase: CreateStaffUserUseCase,
    private readonly deleteStaffUserUseCase: DeleteStaffUserUseCase,
    private readonly branchFacade: BranchFacade,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Email/şifrə ilə daxil ol, JWT tokenlər al' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const session = await this.loginUseCase.execute(dto.email, dto.password);
    const branchNames = await this.branchFacade.resolveNames([session.branchId]);
    return AuthMapper.toLoginResponseDto(session, branchNames);
  }

  @ApiBearerAuth('bearerAuth')
  @Get('me')
  @ApiOperation({
    summary: 'Cari autentifikasiya olunmuş istifadəçinin məlumatı',
  })
  @ApiResponse({ status: 200, type: CurrentUserResponseDto })
  async getCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CurrentUserResponseDto> {
    const branchNames = await this.branchFacade.resolveNames([user.branchId]);
    return AuthMapper.toCurrentUserResponseDto(user, branchNames);
  }

  @ApiBearerAuth('bearerAuth')
  @Roles(Role.ADMIN)
  @Post('staff')
  @ApiOperation({
    summary: 'Yeni filial işçisi/admin hesabı yarat (yalnız admin)',
  })
  @ApiResponse({ status: 201, type: StaffUserResponseDto })
  async createStaffUser(
    @Body() dto: CreateStaffUserDto,
  ): Promise<StaffUserResponseDto> {
    const staffUser = await this.createStaffUserUseCase.execute({
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
      role: dto.role,
      branchId: dto.branchId ?? null,
    });
    const branchNames = await this.branchFacade.resolveNames([
      staffUser.branchId,
    ]);
    return AuthMapper.toStaffUserResponseDto(staffUser, branchNames);
  }

  @ApiBearerAuth('bearerAuth')
  @Roles(Role.ADMIN)
  @Delete('staff/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Filial işçisi/admin hesabını sil (yalnız admin)',
  })
  @ApiResponse({ status: 204, description: 'İstifadəçi silindi' })
  async deleteStaffUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.deleteStaffUserUseCase.execute(id, user.id);
  }
}
