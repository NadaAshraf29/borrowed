import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SettingsService } from '../settings/settings.service';
import { DressesService } from '../dresses/dresses.service';
import { CalculateRentalDto, CreateBookingDto, ProcessPaymentDto } from './dto';
import { RentalStatus, PaymentStatus, DeliveryTaskStage, DeliveryTaskStatus, PayoutStatus, RoleType } from '@prisma/client';

@Injectable()
export class RentalsService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private dressesService: DressesService,
  ) {}

  async calculateRental(dto: CalculateRentalDto) {
    const dress = await this.prisma.dress.findUnique({
      where: { id: dto.dressId },
    });
    if (!dress) throw new NotFoundException('Dress not found');

    const settings = await this.settingsService.getAllSettings();
    const availability = await this.dressesService.checkAvailability(dto.dressId, dto.occasionDate);

    // City delivery fee
    const city = await this.prisma.city.findFirst({
      where: { name: { contains: dto.deliveryCityName, mode: 'insensitive' }, isActive: true },
    });
    const deliveryFee = city ? city.deliveryFee : 180;
    const depositFee = settings.requireDeposit ? settings.defaultDepositAmount : 0;

    const commissionPercent = settings.commissionPercentage;
    const platformCommission = Math.round(dress.rentalPrice * (commissionPercent / 100));
    const ownerEarnings = dress.rentalPrice - platformCommission;
    const totalAmount = dress.rentalPrice + deliveryFee + depositFee;

    return {
      occasionDate: availability.occasionDate,
      scheduledDeliveryDate: availability.scheduledDeliveryDate,
      scheduledReturnDate: availability.scheduledReturnDate,
      rentalPrice: dress.rentalPrice,
      deliveryFee,
      depositFee,
      totalAmount,
      commissionRate: commissionPercent,
      platformCommission,
      ownerEarnings,
      isAvailable: availability.isAvailable,
      conflictReason: availability.conflictReason,
    };
  }

  async createBooking(renterId: string, dto: CreateBookingDto) {
    const renter = await this.prisma.user.findUnique({ where: { id: renterId } });
    if (!renter) throw new NotFoundException('Renter not found');

    const dress = await this.prisma.dress.findUnique({
      where: { id: dto.dressId },
      include: { owner: true },
    });
    if (!dress) throw new NotFoundException('Dress not found');

    if (dress.ownerId === renterId) {
      throw new BadRequestException('You cannot rent your own dress');
    }

    // Availability validation (server-side security rule: never trust frontend calculations)
    const calculation = await this.calculateRental({
      dressId: dto.dressId,
      occasionDate: dto.occasionDate,
      deliveryCityName: dto.deliveryAddress.city,
    });

    if (!calculation.isAvailable) {
      throw new BadRequestException(calculation.conflictReason || 'Dress is unavailable for selected dates');
    }

    // Generate reference: BRW-YYYY-XXXX
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `BRW-${new Date().getFullYear()}-${randomCode}`;

    const pickupAddress = {
      city: dress.city,
      area: dress.pickupArea,
      street: 'Confirmed Pickup Location',
      contactName: `${dress.owner.firstName} ${dress.owner.lastName}`,
      contactPhone: dress.owner.phoneNumber || '',
    };

    const booking = await this.prisma.rentalBooking.create({
      data: {
        bookingReference,
        dressId: dress.id,
        renterId,
        occasionDate: new Date(calculation.occasionDate),
        scheduledDeliveryDate: new Date(calculation.scheduledDeliveryDate),
        scheduledReturnDate: new Date(calculation.scheduledReturnDate),
        rentalPriceSnapshot: calculation.rentalPrice,
        commissionRateSnapshot: calculation.commissionRate,
        platformCommission: calculation.platformCommission,
        ownerEarnings: calculation.ownerEarnings,
        deliveryFeeSnapshot: calculation.deliveryFee,
        depositFeeSnapshot: calculation.depositFee,
        totalAmount: calculation.totalAmount,
        status: RentalStatus.PENDING_PAYMENT,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: dto.paymentMethod,
        deliveryAddressJson: dto.deliveryAddress,
        pickupAddressJson: pickupAddress,
        statusHistory: {
          create: [{ status: RentalStatus.PENDING_PAYMENT, note: 'Booking initiated, awaiting payment confirmation' }],
        },
      },
      include: {
        dress: { include: { images: true } },
        renter: true,
      },
    });

    return booking;
  }

  async processPayment(bookingId: string, renterId: string, dto: ProcessPaymentDto) {
    const booking = await this.prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: { dress: { include: { owner: true } } },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.renterId !== renterId) {
      throw new BadRequestException('Not authorized to pay for this booking');
    }

    if (booking.paymentStatus === PaymentStatus.COMPLETED) {
      return booking;
    }

    const paymentRef = `PAY-TX-${Math.floor(100000 + Math.random() * 900000)}`;

    // Update booking to CONFIRMED
    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Record payment
      const payment = await tx.payment.create({
        data: {
          rentalBookingId: booking.id,
          amount: booking.totalAmount,
          method: dto.paymentMethod,
          status: PaymentStatus.COMPLETED,
          referenceCode: paymentRef,
          providerDetails: dto.cardDetails
            ? {
                brand: 'Visa / Mastercard',
                last4: dto.cardDetails.cardNumber.slice(-4) || '4242',
                holder: dto.cardDetails.cardholderName,
              }
            : { method: dto.paymentMethod },
        },
      });

      // 2. Record immutable owner earning ledger entry
      await tx.ownerEarning.create({
        data: {
          ownerId: booking.dress.ownerId,
          rentalBookingId: booking.id,
          grossAmount: booking.rentalPriceSnapshot,
          commissionRate: booking.commissionRateSnapshot,
          commissionFee: booking.platformCommission,
          netEarnings: booking.ownerEarnings,
          payoutStatus: PayoutStatus.ELIGIBLE,
        },
      });

      // 3. Create the 4-Stage Delivery Tasks
      const delivAddress = booking.deliveryAddressJson as any;
      const pickupAddress = booking.pickupAddressJson as any;

      // Find an active driver to auto-assign or leave pending for admin dispatch
      const driver = await tx.userRole.findFirst({
        where: { role: { name: RoleType.DELIVERY } },
        include: { user: true },
      });

      // Stage 1: Pickup from Owner
      await tx.deliveryTask.create({
        data: {
          rentalBookingId: booking.id,
          stage: DeliveryTaskStage.PICKUP_FROM_OWNER,
          status: driver ? DeliveryTaskStatus.ASSIGNED : DeliveryTaskStatus.PENDING,
          driverId: driver?.userId || null,
          targetAddress: `${pickupAddress.city}, ${pickupAddress.area}, ${pickupAddress.street}`,
          contactName: pickupAddress.contactName,
          contactPhone: pickupAddress.contactPhone,
          scheduledDate: booking.scheduledDeliveryDate,
          proofNotes: 'Collect in original dustbag with hanger.',
        },
      });

      // Stage 2: Deliver to Renter
      await tx.deliveryTask.create({
        data: {
          rentalBookingId: booking.id,
          stage: DeliveryTaskStage.DELIVER_TO_RENTER,
          status: DeliveryTaskStatus.PENDING,
          driverId: driver?.userId || null,
          targetAddress: `${delivAddress.city}, ${delivAddress.area}, ${delivAddress.street}, Bldg ${delivAddress.building}`,
          contactName: delivAddress.recipientName,
          contactPhone: delivAddress.recipientPhone,
          scheduledDate: booking.scheduledDeliveryDate,
        },
      });

      // Stage 3: Collect from Renter
      await tx.deliveryTask.create({
        data: {
          rentalBookingId: booking.id,
          stage: DeliveryTaskStage.COLLECT_FROM_RENTER,
          status: DeliveryTaskStatus.PENDING,
          driverId: driver?.userId || null,
          targetAddress: `${delivAddress.city}, ${delivAddress.area}, ${delivAddress.street}, Bldg ${delivAddress.building}`,
          contactName: delivAddress.recipientName,
          contactPhone: delivAddress.recipientPhone,
          scheduledDate: booking.scheduledReturnDate,
        },
      });

      // Stage 4: Return to Owner
      await tx.deliveryTask.create({
        data: {
          rentalBookingId: booking.id,
          stage: DeliveryTaskStage.RETURN_TO_OWNER,
          status: DeliveryTaskStatus.PENDING,
          driverId: driver?.userId || null,
          targetAddress: `${pickupAddress.city}, ${pickupAddress.area}, ${pickupAddress.street}`,
          contactName: pickupAddress.contactName,
          contactPhone: pickupAddress.contactPhone,
          scheduledDate: booking.scheduledReturnDate,
        },
      });

      // 4. Update Booking
      const confirmedBooking = await tx.rentalBooking.update({
        where: { id: booking.id },
        data: {
          status: RentalStatus.CONFIRMED,
          paymentStatus: PaymentStatus.COMPLETED,
          statusHistory: {
            create: [
              {
                status: RentalStatus.CONFIRMED,
                note: `Payment verified (${dto.paymentMethod}). Reference: ${paymentRef}`,
              },
            ],
          },
        },
        include: {
          dress: { include: { images: true } },
          statusHistory: true,
          deliveryTasks: true,
        },
      });

      // 5. Notify Renter & Owner
      await tx.notification.create({
        data: {
          userId: renterId,
          title: 'Booking Confirmed!',
          message: `Your booking ${booking.bookingReference} for ${booking.dress.title} is confirmed. Delivery is scheduled 3 days before your event.`,
          type: 'RENTAL_CONFIRMED',
          link: '/rentals',
        },
      });

      await tx.notification.create({
        data: {
          userId: booking.dress.ownerId,
          title: 'New Confirmed Rental Request',
          message: `Your dress "${booking.dress.title}" has been booked! Net earnings of EGP ${booking.ownerEarnings} will be credited upon completion.`,
          type: 'OWNER_RENTAL_BOOKED',
          link: '/owner',
        },
      });

      return confirmedBooking;
    });

    return updated;
  }

  async getMyRentals(renterId: string, tab?: 'upcoming' | 'active' | 'completed' | 'cancelled') {
    const where: any = { renterId };

    if (tab === 'upcoming') {
      where.status = { in: [RentalStatus.CONFIRMED, RentalStatus.PICKUP_SCHEDULED, RentalStatus.PREPARING] };
    } else if (tab === 'active') {
      where.status = {
        in: [
          RentalStatus.COLLECTED_FROM_OWNER,
          RentalStatus.OUT_FOR_DELIVERY,
          RentalStatus.DELIVERED,
          RentalStatus.RETURN_SCHEDULED,
          RentalStatus.OUT_FOR_COLLECTION,
        ],
      };
    } else if (tab === 'completed') {
      where.status = { in: [RentalStatus.COMPLETED, RentalStatus.RETURNED_TO_OWNER] };
    } else if (tab === 'cancelled') {
      where.status = { in: [RentalStatus.CANCELLED, RentalStatus.DISPUTED] };
    }

    const bookings = await this.prisma.rentalBooking.findMany({
      where,
      include: {
        dress: {
          include: { images: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        deliveryTasks: {
          include: { driver: { select: { firstName: true, lastName: true, phoneNumber: true } } },
          orderBy: { scheduledDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((b) => ({
      ...b,
      coverImage: b.dress.images.find((img) => img.isCover)?.url || b.dress.images[0]?.url || '',
    }));
  }

  async getBookingById(id: string, userId: string, roles: RoleType[]) {
    const booking = await this.prisma.rentalBooking.findUnique({
      where: { id },
      include: {
        dress: {
          include: {
            images: true,
            owner: { select: { id: true, firstName: true, lastName: true, phoneNumber: true } },
          },
        },
        renter: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        deliveryTasks: {
          include: { driver: { select: { firstName: true, lastName: true, phoneNumber: true } } },
          orderBy: { createdAt: 'asc' },
        },
        payments: true,
        reviews: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const isAdmin = roles.includes(RoleType.ADMIN);
    const isCourier = roles.includes(RoleType.DELIVERY);
    const isOwner = booking.dress.ownerId === userId;
    const isRenter = booking.renterId === userId;

    if (!isAdmin && !isCourier && !isOwner && !isRenter) {
      throw new BadRequestException('Not authorized to view this booking');
    }

    return {
      ...booking,
      coverImage: booking.dress.images.find((img) => img.isCover)?.url || booking.dress.images[0]?.url || '',
    };
  }

  async getAllAdminRentals(status?: RentalStatus) {
    return this.prisma.rentalBooking.findMany({
      where: status ? { status } : {},
      include: {
        dress: {
          include: {
            images: true,
            owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        renter: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
        deliveryTasks: {
          include: { driver: { select: { firstName: true, lastName: true, phoneNumber: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async requestReturn(bookingId: string, renterId: string, notes?: string) {
    const booking = await this.prisma.rentalBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.renterId !== renterId) throw new BadRequestException('Not authorized');

    return this.prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: RentalStatus.RETURN_SCHEDULED,
        statusHistory: {
          create: [
            {
              status: RentalStatus.RETURN_SCHEDULED,
              note: `Renter requested return pickup. Notes: ${notes || 'Ready for courier collection'}`,
            },
          ],
        },
      },
    });
  }
}

