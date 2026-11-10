import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DeliveryTaskStage, DeliveryTaskStatus, RentalStatus, RoleType, PayoutStatus } from '@prisma/client';

export interface UpdateDeliveryStatusDto {
  status: DeliveryTaskStatus;
  proofNotes?: string;
  proofImageUrl?: string;
  failedReason?: string;
}

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async getMyTasks(driverId: string, stage?: DeliveryTaskStage, status?: DeliveryTaskStatus) {
    const where: any = { driverId };
    if (stage) where.stage = stage;
    if (status) where.status = status;

    return this.prisma.deliveryTask.findMany({
      where,
      include: {
        rentalBooking: {
          include: {
            dress: { include: { images: true, owner: true } },
            renter: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async getAllTasksAdmin(stage?: DeliveryTaskStage, status?: DeliveryTaskStatus) {
    const where: any = {};
    if (stage) where.stage = stage;
    if (status) where.status = status;

    return this.prisma.deliveryTask.findMany({
      where,
      include: {
        driver: { select: { id: true, firstName: true, lastName: true, phoneNumber: true } },
        rentalBooking: {
          include: {
            dress: { select: { title: true, brand: true, rentalPrice: true, city: true } },
            renter: { select: { firstName: true, lastName: true, phoneNumber: true } },
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async assignDriver(taskId: string, driverId: string) {
    const task = await this.prisma.deliveryTask.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Delivery task not found');

    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
      include: { roles: { include: { role: true } } },
    });
    if (!driver) throw new NotFoundException('Driver not found');

    return this.prisma.deliveryTask.update({
      where: { id: taskId },
      data: {
        driverId,
        status: DeliveryTaskStatus.ASSIGNED,
      },
      include: { driver: true },
    });
  }

  async updateTaskStatus(taskId: string, userId: string, roles: RoleType[], dto: UpdateDeliveryStatusDto) {
    const task = await this.prisma.deliveryTask.findUnique({
      where: { id: taskId },
      include: {
        rentalBooking: {
          include: {
            dress: true,
            renter: true,
          },
        },
      },
    });

    if (!task) throw new NotFoundException('Delivery task not found');

    const isAdmin = roles.includes(RoleType.ADMIN);
    const isAssignedDriver = task.driverId === userId;

    if (!isAdmin && !isAssignedDriver) {
      throw new BadRequestException('Not authorized to update this delivery task');
    }

    const now = new Date();
    const isCompleted = dto.status === DeliveryTaskStatus.COMPLETED;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update the delivery task
      const updatedTask = await tx.deliveryTask.update({
        where: { id: taskId },
        data: {
          status: dto.status,
          completedAt: isCompleted ? now : null,
          proofNotes: dto.proofNotes,
          proofImageUrl: dto.proofImageUrl,
          failedReason: dto.failedReason,
        },
        include: { driver: true },
      });

      // 2. Advance parent rental booking status depending on task stage
      if (isCompleted) {
        let nextRentalStatus: RentalStatus = task.rentalBooking.status;
        let updateData: any = {};
        let timelineNote = '';

        if (task.stage === DeliveryTaskStage.PICKUP_FROM_OWNER) {
          nextRentalStatus = RentalStatus.COLLECTED_FROM_OWNER;
          timelineNote = `Dress collected from owner (${task.rentalBooking.dress.pickupArea}). Note: ${dto.proofNotes || 'Verified condition.'}`;
        } else if (task.stage === DeliveryTaskStage.DELIVER_TO_RENTER) {
          nextRentalStatus = RentalStatus.DELIVERED;
          updateData.actualDeliveryDate = now;
          timelineNote = `Dress delivered to renter. Note: ${dto.proofNotes || 'Delivered on time.'}`;
        } else if (task.stage === DeliveryTaskStage.COLLECT_FROM_RENTER) {
          nextRentalStatus = RentalStatus.COLLECTED_FROM_RENTER;
          timelineNote = `Dress collected from renter post-occasion. Note: ${dto.proofNotes || 'Received garment.'}`;
        } else if (task.stage === DeliveryTaskStage.RETURN_TO_OWNER) {
          nextRentalStatus = RentalStatus.COMPLETED;
          updateData.actualReturnDate = now;
          timelineNote = `Dress returned to owner. Rental lifecycle completed. Note: ${dto.proofNotes || 'Owner confirmed receipt.'}`;

          // Mark owner earning as ready for payout
          await tx.ownerEarning.updateMany({
            where: { rentalBookingId: task.rentalBookingId },
            data: { payoutStatus: PayoutStatus.ELIGIBLE },
          });
        }

        // Apply rental status update and history record
        await tx.rentalBooking.update({
          where: { id: task.rentalBookingId },
          data: {
            ...updateData,
            status: nextRentalStatus,
            statusHistory: {
              create: [
                {
                  status: nextRentalStatus,
                  note: timelineNote,
                  actorId: userId,
                },
              ],
            },
          },
        });

        // Notifications
        if (task.stage === DeliveryTaskStage.DELIVER_TO_RENTER) {
          await tx.notification.create({
            data: {
              userId: task.rentalBooking.renterId,
              title: 'Dress Delivered!',
              message: `Your dress "${task.rentalBooking.dress.title}" has been delivered. Enjoy your special occasion!`,
              type: 'DELIVERED',
              link: '/rentals',
            },
          });
        } else if (task.stage === DeliveryTaskStage.RETURN_TO_OWNER) {
          await tx.notification.create({
            data: {
              userId: task.rentalBooking.dress.ownerId,
              title: 'Dress Returned & Rental Completed',
              message: `Your dress "${task.rentalBooking.dress.title}" has been safely returned. Your earnings are eligible for payout.`,
              type: 'RENTAL_COMPLETED',
              link: '/owner',
            },
          });
        }
      }

      return updatedTask;
    });
  }

  async getCouriersList() {
    return this.prisma.user.findMany({
      where: {
        roles: { some: { role: { name: RoleType.DELIVERY } } },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
      },
    });
  }
}

