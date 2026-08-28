import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role as PrismaRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../../../../../shared/auth/jwt-payload.interface';
import {
  generateRefreshToken,
  hashRefreshToken,
  parseDurationToSeconds,
} from '../../../../../shared/auth/token.util';
import { Role } from '../../../../../shared/guards/roles.enum';
import { BusinessRuleViolationException } from '../../../../../shared/kernel/domain.exception';
import { toPrismaSkipTake } from '../../../../../shared/pagination/prisma-pagination.util';
import {
  createPaginatedResult,
} from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { AuthSession } from '../../../domain/entities/auth-session.entity';
import { StaffUser } from '../../../domain/entities/staff-user.entity';
import {
  CreateStaffUserInput,
  IAuthRepository,
  StaffListOptions,
} from '../../../domain/repositories/auth.repository.interface';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(email: string, password: string): Promise<AuthSession> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Email və ya şifrə yanlışdır');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Email və ya şifrə yanlışdır');
    }

    return this.issueSession(user);
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    const tokenHash = hashRefreshToken(refreshToken);
    const user = await this.prisma.user.findFirst({
      where: { refreshTokenHash: tokenHash },
    });

    if (!user) {
      throw new UnauthorizedException('Refresh token yanlış və ya vaxtı bitib');
    }

    return this.issueSession(user);
  }

  async createStaffUser(input: CreateStaffUserInput): Promise<StaffUser> {
    const email = input.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BusinessRuleViolationException(
        'Bu email artıq qeydiyyatdan keçib',
      );
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          role: input.role as PrismaRole,
          branchId: input.branchId,
          fullName: input.fullName ?? null,
        },
      });

      return new StaffUser(
        user.id,
        user.email,
        user.fullName ?? undefined,
        user.role as Role,
        user.branchId,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'İstifadəçi yaradıla bilmədi';
      throw new BusinessRuleViolationException(message);
    }
  }

  async findAllStaffUsers(
    options?: StaffListOptions,
  ): Promise<PaginatedResult<StaffUser>> {
    const { skip, take } = toPrismaSkipTake(options?.pagination);
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.user.count(),
    ]);

    return createPaginatedResult(
      users.map(
        (user) =>
          new StaffUser(
            user.id,
            user.email,
            user.fullName ?? undefined,
            user.role as Role,
            user.branchId,
          ),
      ),
      total,
      options?.pagination,
    );
  }

  async findStaffUserById(id: string): Promise<StaffUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }

    return new StaffUser(
      user.id,
      user.email,
      user.fullName ?? undefined,
      user.role as Role,
      user.branchId,
    );
  }

  async countStaffByRole(role: Role): Promise<number> {
    return this.prisma.user.count({
      where: { role: role as PrismaRole },
    });
  }

  async deleteStaffUser(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'İstifadəçi silinə bilmədi';
      throw new BusinessRuleViolationException(message);
    }
  }

  private async issueSession(user: {
    id: string;
    email: string;
    role: PrismaRole;
    branchId: string | null;
  }): Promise<AuthSession> {
    const accessExpiresIn = this.configService.get<string>(
      'jwt.expiresIn',
      '7d',
    );
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('jwt.secret'),
      expiresIn: accessExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    const refreshToken = generateRefreshToken();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: hashRefreshToken(refreshToken) },
    });

    return new AuthSession(
      user.id,
      user.email,
      user.role as Role,
      user.branchId,
      accessToken,
      refreshToken,
      parseDurationToSeconds(accessExpiresIn),
    );
  }
}
