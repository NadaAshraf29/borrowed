import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDressDto, UpdateDressDto, ModerateDressDto, FilterDressesQuery } from './dto';
import { DressStatus, RoleType, RentalStatus } from '@prisma/client';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class DressesService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async findAll(query: FilterDressesQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    const where: any = {
      status: DressStatus.APPROVED,
    };

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.occasion) {
      where.occasions = { has: query.occasion };
    }

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }

    if (query.size) {
      where.size = { contains: query.size, mode: 'insensitive' };
    }

    if (query.color) {
      where.color = { contains: query.color, mode: 'insensitive' };
    }

    if (query.brand) {
      where.brand = { contains: query.brand, mode: 'insensitive' };
    }

    if (query.minPrice || query.maxPrice) {
      where.rentalPrice = {};
      if (query.minPrice) where.rentalPrice.gte = Number(query.minPrice);
      if (query.maxPrice) where.rentalPrice.lte = Number(query.maxPrice);
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { color: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'price_asc') orderBy = { rentalPrice: 'asc' };
    if (query.sort === 'price_desc') orderBy = { rentalPrice: 'desc' };
    if (query.sort === 'popular') orderBy = { viewCount: 'desc' };

    const [total, dresses] = await Promise.all([
      this.prisma.dress.count({ where }),
      this.prisma.dress.findMany({
        where,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          category: true,
          owner: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const formatted = dresses.map((d) => {
      const cover = d.images.find((img) => img.isCover)?.url || d.images[0]?.url || '';
      const avgRating = d.reviews.length
        ? Number((d.reviews.reduce((acc, r) => acc + r.rating, 0) / d.reviews.length).toFixed(1))
        : 5.0;

      return {
        ...d,
        coverImage: cover,
        ownerName: `${d.owner.firstName} ${d.owner.lastName}`,
        averageRating: avgRating,
        totalReviews: d.reviews.length,
      };
    });

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFeatured() {
    const dresses = await this.prisma.dress.findMany({
      where: { status: DressStatus.APPROVED },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        owner: { select: { id: true, firstName: true, lastName: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { viewCount: 'desc' },
      take: 8,
    });

    return dresses.map((d) => ({
      ...d,
      coverImage: d.images.find((img) => img.isCover)?.url || d.images[0]?.url || '',
      ownerName: `${d.owner.firstName} ${d.owner.lastName}`,
      averageRating: d.reviews.length
        ? Number((d.reviews.reduce((acc, r) => acc + r.rating, 0) / d.reviews.length).toFixed(1))
        : 5.0,
      totalReviews: d.reviews.length,
    }));
  }

  async findOne(id: string) {
    const dress = await this.prisma.dress.findUnique({
      where: { id },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        owner: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, createdAt: true },
        },
        reviews: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!dress) {
      throw new NotFoundException('Dress not found');
    }

    // Increment view count asynchronously
    await this.prisma.dress.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const cover = dress.images.find((img) => img.isCover)?.url || dress.images[0]?.url || '';
    const avgRating = dress.reviews.length
      ? Number((dress.reviews.reduce((acc, r) => acc + r.rating, 0) / dress.reviews.length).toFixed(1))
      : 5.0;

    return {
      ...dress,
      coverImage: cover,
      ownerName: `${dress.owner.firstName} ${dress.owner.lastName}`,
      averageRating: avgRating,
      totalReviews: dress.reviews.length,
    };
  }

  async create(ownerId: string, dto: CreateDressDto) {
    let category = await this.prisma.dressCategory.findUnique({
      where: { slug: dto.categorySlug },
    });
    if (!category) {
      category = await this.prisma.dressCategory.findFirst();
    }

    const dress = await this.prisma.dress.create({
      data: {
        title: dto.title,
        description: dto.description,
        brand: dto.brand,
        categoryId: category!.id,
        occasions: dto.occasions || ['Weddings', 'Parties'],
        size: dto.size,
        color: dto.color,
        material: dto.material,
        condition: dto.condition,
        rentalPrice: Number(dto.rentalPrice),
        replacementValue: dto.replacementValue ? Number(dto.replacementValue) : null,
        city: dto.city,
        pickupArea: dto.pickupArea,
        status: DressStatus.PENDING_REVIEW, // Required review step before public listing
        ownerId,
        images: {
          create: dto.images.map((img, idx) => ({
            url: img.url,
            isCover: img.isCover ?? idx === 0,
            displayOrder: img.displayOrder ?? idx,
          })),
        },
      },
      include: { images: true, category: true },
    });

    // Create notification for admin
    const admins = await this.prisma.userRole.findMany({
      where: { role: { name: RoleType.ADMIN } },
      select: { userId: true },
    });
    for (const a of admins) {
      await this.prisma.notification.create({
        data: {
          userId: a.userId,
          title: 'New Dress Submitted for Review',
          message: `"${dto.title}" by ${dto.brand} has been submitted by an owner.`,
          type: 'DRESS_SUBMITTED',
          link: '/admin',
        },
      });
    }

    return dress;
  }

  async update(id: string, userId: string, userRoles: RoleType[], dto: UpdateDressDto) {
    const dress = await this.prisma.dress.findUnique({ where: { id } });
    if (!dress) throw new NotFoundException('Dress not found');

    const isAdmin = userRoles.includes(RoleType.ADMIN);
    if (dress.ownerId !== userId && !isAdmin) {
      throw new ForbiddenException('Not authorized to edit this dress');
    }

    // Critical change: if owner changes price or photos, set back to pending review
    let nextStatus = dress.status;
    if (!isAdmin && (dto.rentalPrice || dto.images)) {
      nextStatus = DressStatus.PENDING_REVIEW;
    }

    return this.prisma.dress.update({
      where: { id },
      data: {
        title: dto.title ?? dress.title,
        description: dto.description ?? dress.description,
        brand: dto.brand ?? dress.brand,
        size: dto.size ?? dress.size,
        color: dto.color ?? dress.color,
        material: dto.material ?? dress.material,
        condition: dto.condition ?? dress.condition,
        rentalPrice: dto.rentalPrice ? Number(dto.rentalPrice) : dress.rentalPrice,
        replacementValue: dto.replacementValue ? Number(dto.replacementValue) : dress.replacementValue,
        city: dto.city ?? dress.city,
        pickupArea: dto.pickupArea ?? dress.pickupArea,
        status: nextStatus,
      },
      include: { images: true, category: true },
    });
  }

  async moderate(id: string, adminId: string, dto: ModerateDressDto) {
    const dress = await this.prisma.dress.findUnique({ where: { id } });
    if (!dress) throw new NotFoundException('Dress not found');

    const updated = await this.prisma.dress.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.status === DressStatus.REJECTED ? dto.reason : null,
        moderations: {
          create: {
            adminId,
            fromStatus: dress.status,
            toStatus: dto.status,
            reason: dto.reason,
            notes: dto.notes,
          },
        },
      },
      include: { owner: true },
    });

    // Notify owner
    const message =
      dto.status === DressStatus.APPROVED
        ? `Congratulations! Your dress "${dress.title}" has been approved and is now live on BORROWED.`
        : `Your dress "${dress.title}" requires updates before publishing: ${dto.reason || 'Please review our guidelines'}`;

    await this.prisma.notification.create({
      data: {
        userId: dress.ownerId,
        title: dto.status === DressStatus.APPROVED ? 'Listing Approved!' : 'Listing Needs Revision',
        message,
        type: dto.status === DressStatus.APPROVED ? 'DRESS_APPROVED' : 'DRESS_REJECTED',
        link: '/owner',
      },
    });

    return updated;
  }

  async getOwnerDresses(ownerId: string) {
    const dresses = await this.prisma.dress.findMany({
      where: { ownerId },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        rentalBookings: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            ownerEarnings: true,
            occasionDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return dresses.map((d) => {
      const cover = d.images.find((img) => img.isCover)?.url || d.images[0]?.url || '';
      const totalEarned = d.rentalBookings
        .filter((r) => r.status === RentalStatus.COMPLETED)
        .reduce((sum, r) => sum + r.ownerEarnings, 0);

      return {
        ...d,
        coverImage: cover,
        totalRentals: d.rentalBookings.length,
        totalEarned,
      };
    });
  }

  async getAdminDresses(status?: DressStatus) {
    return this.prisma.dress.findMany({
      where: status ? { status } : {},
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkAvailability(dressId: string, occasionDateStr: string) {
    const settings = await this.settingsService.getAllSettings();
    const occasionDate = new Date(occasionDateStr);

    if (isNaN(occasionDate.getTime())) {
      throw new BadRequestException('Invalid occasion date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delivery date = occasionDate - deliveryDaysBeforeOccasion
    const scheduledDelivery = new Date(occasionDate.getTime() - settings.deliveryDaysBeforeOccasion * 24 * 60 * 60 * 1000);
    // Return date = occasionDate + returnDaysAfterOccasion
    const scheduledReturn = new Date(occasionDate.getTime() + settings.returnDaysAfterOccasion * 24 * 60 * 60 * 1000);

    // Minimum notice check
    const minNoticeDate = new Date(today.getTime() + settings.minimumBookingNoticeDays * 24 * 60 * 60 * 1000);
    if (scheduledDelivery < today) {
      return {
        isAvailable: false,
        conflictReason: `Delivery date (${scheduledDelivery.toISOString().split('T')[0]}) is in the past.`,
        scheduledDeliveryDate: scheduledDelivery.toISOString(),
        scheduledReturnDate: scheduledReturn.toISOString(),
        occasionDate: occasionDate.toISOString(),
      };
    }

    // Overlapping bookings check including preparation buffer days!
    const bufferMs = settings.preparationBufferDays * 24 * 60 * 60 * 1000;
    const windowStart = new Date(scheduledDelivery.getTime() - bufferMs);
    const windowEnd = new Date(scheduledReturn.getTime() + bufferMs);

    const activeBookings = await this.prisma.rentalBooking.findMany({
      where: {
        dressId,
        status: {
          notIn: [RentalStatus.CANCELLED, RentalStatus.COMPLETED],
        },
        OR: [
          {
            scheduledDeliveryDate: { lte: windowEnd },
            scheduledReturnDate: { gte: windowStart },
          },
        ],
      },
    });

    if (activeBookings.length > 0) {
      return {
        isAvailable: false,
        conflictReason: `The dress is already reserved or in dry cleaning during this window (${windowStart.toISOString().split('T')[0]} to ${windowEnd.toISOString().split('T')[0]}).`,
        scheduledDeliveryDate: scheduledDelivery.toISOString(),
        scheduledReturnDate: scheduledReturn.toISOString(),
        occasionDate: occasionDate.toISOString(),
      };
    }

    return {
      isAvailable: true,
      scheduledDeliveryDate: scheduledDelivery.toISOString(),
      scheduledReturnDate: scheduledReturn.toISOString(),
      occasionDate: occasionDate.toISOString(),
    };
  }
}

