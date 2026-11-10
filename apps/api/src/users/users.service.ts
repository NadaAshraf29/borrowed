import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoleType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(role?: RoleType) {
    const where: any = {};
    if (role) {
      where.roles = { some: { role: { name: role } } };
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatarUrl: true,
        isActive: true,
        payoutMethod: true,
        payoutDetails: true,
        createdAt: true,
        roles: { select: { role: { select: { name: true } } } },
        _count: {
          select: {
            ownedDresses: true,
            rentalsAsRenter: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phoneNumber?: string; payoutMethod?: string; payoutDetails?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async addAddress(userId: string, data: { cityId: string; area: string; street: string; building: string; floor?: string; apartment?: string; notes?: string }) {
    return this.prisma.address.create({
      data: {
        userId,
        ...data,
      },
      include: { city: true },
    });
  }
}

