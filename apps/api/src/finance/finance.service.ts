import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PayoutStatus, RentalStatus } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getOwnerOverview(ownerId: string) {
    const earnings = await this.prisma.ownerEarning.findMany({
      where: { ownerId },
      include: {
        rentalBooking: {
          include: { dress: { select: { title: true, brand: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalGross = earnings.reduce((acc, e) => acc + e.grossAmount, 0);
    const totalCommission = earnings.reduce((acc, e) => acc + e.commissionFee, 0);
    const totalNetEarnings = earnings.reduce((acc, e) => acc + e.netEarnings, 0);

    const paidAmount = earnings
      .filter((e) => e.payoutStatus === PayoutStatus.COMPLETED)
      .reduce((acc, e) => acc + e.netEarnings, 0);

    const pendingAmount = totalNetEarnings - paidAmount;

    const payouts = await this.prisma.ownerPayout.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalGross,
      totalCommission,
      totalNetEarnings,
      paidAmount,
      pendingAmount,
      earnings,
      payouts,
    };
  }

  async getAdminOverview() {
    const [bookings, payments, earnings, payouts] = await Promise.all([
      this.prisma.rentalBooking.findMany({
        where: { status: { notIn: [RentalStatus.CANCELLED] } },
      }),
      this.prisma.payment.findMany({ where: { status: 'COMPLETED' } }),
      this.prisma.ownerEarning.findMany(),
      this.prisma.ownerPayout.findMany(),
    ]);

    const grossRentalValue = bookings.reduce((sum, b) => sum + b.rentalPriceSnapshot, 0);
    const totalCommissionRevenue = bookings.reduce((sum, b) => sum + b.platformCommission, 0);
    const totalDeliveryRevenue = bookings.reduce((sum, b) => sum + b.deliveryFeeSnapshot, 0);
    const totalCustomerPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const pendingOwnerPayouts = earnings
      .filter((e) => e.payoutStatus === PayoutStatus.ELIGIBLE || e.payoutStatus === PayoutStatus.PENDING)
      .reduce((sum, e) => sum + e.netEarnings, 0);

    const completedOwnerPayouts = payouts
      .filter((p) => p.status === PayoutStatus.COMPLETED)
      .reduce((sum, p) => sum + p.totalAmount, 0);

    return {
      grossRentalValue,
      totalCommissionRevenue,
      totalDeliveryRevenue,
      totalCustomerPaid,
      pendingOwnerPayouts,
      completedOwnerPayouts,
      totalBookings: bookings.length,
    };
  }

  async getPayouts(ownerId?: string, status?: PayoutStatus) {
    const where: any = {};
    if (ownerId) where.ownerId = ownerId;
    if (status) where.status = status;

    return this.prisma.ownerPayout.findMany({
      where,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true, payoutMethod: true, payoutDetails: true } },
        earnings: {
          include: {
            rentalBooking: { select: { bookingReference: true, dress: { select: { title: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEligibleEarnings(ownerId?: string) {
    const where: any = { payoutStatus: PayoutStatus.ELIGIBLE };
    if (ownerId) where.ownerId = ownerId;

    return this.prisma.ownerEarning.findMany({
      where,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, payoutMethod: true, payoutDetails: true } },
        rentalBooking: { select: { bookingReference: true, occasionDate: true, dress: { select: { title: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createPayout(adminId: string, ownerId: string, earningIds: string[], method: string, notes?: string) {
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('Owner not found');

    const earnings = await this.prisma.ownerEarning.findMany({
      where: {
        id: { in: earningIds },
        ownerId,
        payoutStatus: PayoutStatus.ELIGIBLE,
      },
    });

    if (earnings.length === 0) {
      throw new BadRequestException('No eligible earnings found for payout');
    }

    const totalAmount = earnings.reduce((sum, e) => sum + e.netEarnings, 0);
    const payoutRef = `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.ownerPayout.create({
        data: {
          ownerId,
          payoutRef,
          totalAmount,
          method: method || owner.payoutMethod || 'Instapay',
          accountInfo: owner.payoutDetails || 'Direct Account',
          status: PayoutStatus.COMPLETED,
          processedBy: adminId,
          processedAt: new Date(),
          notes,
          earnings: {
            connect: earnings.map((e) => ({ id: e.id })),
          },
        },
      });

      // Update all earnings to COMPLETED
      await tx.ownerEarning.updateMany({
        where: { id: { in: earningIds } },
        data: {
          payoutStatus: PayoutStatus.COMPLETED,
          payoutId: payout.id,
        },
      });

      // Notify owner
      await tx.notification.create({
        data: {
          userId: ownerId,
          title: `Payout Processed (EGP ${totalAmount.toLocaleString()})`,
          message: `Your earnings have been transferred via ${payout.method}. Ref: ${payoutRef}`,
          type: 'PAYOUT_COMPLETED',
          link: '/owner',
        },
      });

      return payout;
    });
  }
}

