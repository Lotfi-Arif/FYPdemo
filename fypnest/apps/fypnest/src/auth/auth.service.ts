import { AccountStatus } from '@app/common/generated/index/prisma/account-status.enum';
import { Role } from '@app/common/generated/index/prisma/role.enum';
import { User } from '@app/common/generated/index/user/user.model';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { PasswordService } from '../users/password.service';
import { SignupInput } from './dto/signup.input';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from '@app/common/configs/config.interface';
import { Token } from 'model/token.model';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private emitter: EventEmitter2,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser({
    password,
    email,
    mobile,
    firstName,
    lastName,
    accountStatus,
    ...payload
  }: SignupInput): Promise<Token> {
    const hashedPassword = await this.passwordService.hashPassword(password);

    try {
      const staff = await this.prisma.staff.findUnique({
        where: { email },
      });
      const counselor = await this.prisma.counselor.findUnique({
        where: { email },
      });
      if (staff || counselor) {
        throw new ConflictException(`Email ${email} already used.`);
      }
      // const verification =
      //   payload.role == Role.COUNSELOR
      //     ? { status: AccountStatus.UNVERIFIED }
      //     : undefined;
      const user = await this.prisma.user.create({
        data: {
          password: hashedPassword,
          mobile,
          firstName,
          lastName,
          accountStatus,
          ...payload,
          [payload.role.toLowerCase()]: {
            create: {
              firstName,
              lastName,
              email,
            },
          },
        },
      });
      this.emitter.emit('user.created', user);

      return this.generateTokens({
        userId: user.id,
        role: payload.role,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${email} already used.`);
      } else {
        throw new Error(e);
      }
    }
  }

  async login(email: string, password: string, role: Role): Promise<Token> {
    const model = role.toLowerCase();

    const user = await this.prisma[model as any].findUnique({
      where: { email },
      include: { user: true },
    });
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }
    if (user.status && user.status == AccountStatus.UNVERIFIED) {
      throw new UnauthorizedException('UNVERIFIED_EMAIL');
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    );

    if (!passwordValid) {
      throw new BadRequestException('INVALID_CREDENTIALS');
    }

    return this.generateTokens({
      userId: user.id,
      role: role,
    });
  }
  validateUser(userId: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { staff: true, student: true, counselor: true },
    });
  }

  getUserFromToken(token: string, select?: any): Promise<User> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prisma.user.findUnique({ where: { id }, ...select });
  }

  generateResetToken(email: string) {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(
      { email },
      {
        secret: this.configService.get('JWT_TOKEN_RESET_SECRET'),
        expiresIn: securityConfig.refreshIn,
      },
    );
  }

  generateTokens(payload: { userId: string; role: Role }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  decodeToken(token: string): { email; iat; exp } {
    // const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.decode(token) as { email; iat; exp };
  }

  private generateAccessToken(payload: { userId: string; role: Role }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: {
    userId: string;
    role: Role;
  }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }

  refreshToken(token: string) {
    try {
      const { userId, role } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      return this.generateTokens({
        userId,
        role,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
