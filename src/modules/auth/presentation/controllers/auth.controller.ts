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
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../../../../shared/decorators/public.decorator';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../../shared/guards/authenticated-user.interface';
import { Role } from '../../../../shared/guards/roles.enum';
import { RelationLookupService } from '../../../../shared/relations/relation-lookup.service';
import { CreateStaffUserUseCase } from '../../application/use-cases/create-staff-user.usecase';
import { DeleteStaffUserUseCase } from '../../application/use-cases/delete-staff-user.usecase';
import { ListStaffUsersUseCase } from '../../application/use-cases/list-staff-users.usecase';
import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.usecase';
import { CreateStaffUserDto } from '../../application/dto/create-staff-user.dto';
import { CurrentUserResponseDto } from '../../application/dto/current-user-response.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { LoginResponseDto } from '../../application/dto/login-response.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { StaffUserResponseDto } from '../../application/dto/staff-user-response.dto';
import { AuthMapper } from '../../application/mappers/auth.mapper';

const PaginatedStaffUsersResponseDto = createPaginatedResponseDtoClass(
  StaffUserResponseDto,
  'PaginatedStaffUsersResponseDto',
);

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly createStaffUserUseCase: CreateStaffUserUseCase,
    private readonly listStaffUsersUseCase: ListStaffUsersUseCase,
    private readonly deleteStaffUserUseCase: DeleteStaffUserUseCase,
    private readonly relationLookupService: RelationLookupService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Email/şifrə ilə daxil ol, JWT tokenlər al' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const session = await this.loginUseCase.execute(dto.email, dto.password);
    const lookups = await this.relationLookupService.load({
      branchIds: [session.branchId],
    });
    return AuthMapper.toLoginResponseDto(session, lookups);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Refresh token ilə yeni access token al — sessiyanı davam etdir',
  })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async refresh(@Body() dto: RefreshTokenDto): Promise<LoginResponseDto> {
    const session = await this.refreshSessionUseCase.execute(dto.refreshToken);
    const lookups = await this.relationLookupService.load({
      branchIds: [session.branchId],
    });
    return AuthMapper.toLoginResponseDto(session, lookups);
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
    const lookups = await this.relationLookupService.load({
      branchIds: [user.branchId],
    });
    return AuthMapper.toCurrentUserResponseDto(user, lookups);
  }

  @ApiBearerAuth('bearerAuth')
  @Roles(Role.ADMIN)
  @Get('staff')
  @ApiOperation({
    summary: 'Bütün filial işçisi/admin hesablarının siyahısı (yalnız admin)',
  })
  @ApiResponse({ status: 200, type: PaginatedStaffUsersResponseDto })
  async listStaffUsers(@Query() query: PaginationQueryDto) {
    const result = await this.listStaffUsersUseCase.execute(query);
    const lookups = await this.relationLookupService.load({
      branchIds: result.items.map((staffUser) => staffUser.branchId),
    });
    return createPaginatedResponseDto(
      result,
      AuthMapper.toStaffUserResponseDtoList(result.items, lookups),
    );
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
    const lookups = await this.relationLookupService.load({
      branchIds: [staffUser.branchId],
    });
    return AuthMapper.toStaffUserResponseDto(staffUser, lookups);
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
