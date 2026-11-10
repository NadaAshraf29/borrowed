import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllSettings() {
    const settings = await this.prisma.platformSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

    return {
      commissionPercentage: parseInt(map['commission_percentage'] || '20', 10),
      deliveryDaysBeforeOccasion: parseInt(map['delivery_days_before_occasion'] || '3', 10),
      returnDaysAfterOccasion: parseInt(map['return_days_after_occasion'] || '1', 10),
      preparationBufferDays: parseInt(map['preparation_buffer_days'] || '2', 10),
      minimumBookingNoticeDays: parseInt(map['minimum_booking_notice_days'] || '3', 10),
      requireDeposit: map['require_deposit'] === 'true',
      defaultDepositAmount: parseInt(map['default_deposit_amount'] || '500', 10),
      allowCashCollection: map['allow_cash_collection'] !== 'false',
      cancellationHoursBeforeDelivery: parseInt(map['cancellation_hours_before_delivery'] || '48', 10),
    };
  }

  async updateSetting(key: string, value: string, adminId?: string) {
    return this.prisma.platformSetting.upsert({
      where: { key },
      update: { value, updatedBy: adminId },
      create: { key, value, updatedBy: adminId },
    });
  }

  async updateBulkSettings(settings: Record<string, string>, adminId?: string) {
    const updates = Object.entries(settings).map(([key, value]) =>
      this.prisma.platformSetting.upsert({
        where: { key },
        update: { value, updatedBy: adminId },
        create: { key, value, updatedBy: adminId },
      }),
    );
    await Promise.all(updates);
    return this.getAllSettings();
  }

  async getCities() {
    return this.prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getAllCitiesAdmin() {
    return this.prisma.city.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { addresses: true },
        },
      },
    });
  }

  async updateCityFee(id: string, deliveryFee: number, isActive?: boolean) {
    return this.prisma.city.update({
      where: { id },
      data: {
        deliveryFee,
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
  }

  async createCity(name: string, governorate: string, deliveryFee: number) {
    return this.prisma.city.create({
      data: { name, governorate, deliveryFee },
    });
  }
}

