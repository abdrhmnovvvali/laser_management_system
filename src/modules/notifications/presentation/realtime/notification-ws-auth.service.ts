import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtPayload } from '../../../../shared/auth/jwt-payload.interface';
import { AuthenticatedUser } from '../../../../shared/guards/authenticated-user.interface';
import { Role } from '../../../../shared/guards/roles.enum';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@Injectable()
export class NotificationWsAuthService {
  private readonly logger = new Logger(NotificationWsAuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async authenticate(client: Socket): Promise<AuthenticatedUser> {
    const token = this.extractToken(client);
    if (!token) {
      throw new WsException('Bearer token tapılmadı');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('jwt.secret'),
      });
    } catch {
      throw new WsException('Token yanlış və ya vaxtı bitib');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, branchId: true },
    });

    if (!user) {
      this.logger.warn(`WS istifadəçi tapılmadı: ${payload.sub}`);
      throw new WsException('İstifadəçi tapılmadı');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      branchId: user.branchId,
    };
  }

  private extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.startsWith('Bearer ')
        ? authToken.slice('Bearer '.length)
        : authToken.trim();
    }

    const authHeader = client.handshake.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice('Bearer '.length);
    }

    const queryToken = client.handshake.query.token;
    if (typeof queryToken === 'string' && queryToken.trim()) {
      return queryToken.trim();
    }

    return undefined;
  }
}
