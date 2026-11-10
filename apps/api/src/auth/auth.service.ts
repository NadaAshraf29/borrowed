import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { RoleType } from '@prisma/client';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: 'RENTER' | 'OWNER';
}

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new BadRequestException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const targetRole = dto.role === 'OWNER' ? RoleType.OWNER : RoleType.RENTER;

    // Fetch roles
    const mainRole = await this.prisma.role.findUnique({ where: { name: targetRole } });
    const renterRole = await this.prisma.role.findUnique({ where: { name: RoleType.RENTER } });

    const rolesToCreate = [{ roleId: mainRole!.id }];
    // If owner, also grant renter capability so owners can rent without separate accounts
    if (targetRole === RoleType.OWNER && renterRole && mainRole!.id !== renterRole.id) {
      rolesToCreate.push({ roleId: renterRole.id });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        roles: {
          create: rolesToCreate,
        },
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokens(user);
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: { role: true },
        },
        addresses: {
          include: { city: true },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      payoutMethod: user.payoutMethod,
      payoutDetails: user.payoutDetails,
      roles: user.roles.map((r) => r.role.name),
      addresses: user.addresses,
      createdAt: user.createdAt,
    };
  }

  private generateTokens(user: any) {
    const roles = user.roles.map((r: any) => r.role?.name || r);
    const payload = { sub: user.id, email: user.email, roles };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'borrowed-luxury-secret-key-super-secure-2026',
      expiresIn: '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'borrowed-luxury-refresh-secret-key-super-secure-2026',
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}

