import { Controller, Get, Put, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { DeliveryService, UpdateDeliveryStatusDto } from './delivery.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { RoleType, DeliveryTaskStage, DeliveryTaskStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Delivery Logistics')
@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get('my-tasks')
  @Roles(RoleType.DELIVERY, RoleType.ADMIN)
  @ApiOperation({ summary: 'Get assigned delivery tasks for logged-in courier' })
  async getMyTasks(
    @Request() req: any,
    @Query('stage') stage?: DeliveryTaskStage,
    @Query('status') status?: DeliveryTaskStatus,
  ) {
    return this.deliveryService.getMyTasks(req.user.id, stage, status);
  }

  @Get('admin/tasks')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get all delivery tasks across all stages (Admin only)' })
  async getAllTasks(
    @Query('stage') stage?: DeliveryTaskStage,
    @Query('status') status?: DeliveryTaskStatus,
  ) {
    return this.deliveryService.getAllTasksAdmin(stage, status);
  }

  @Get('couriers')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'List active delivery couriers for task assignment' })
  async getCouriers() {
    return this.deliveryService.getCouriersList();
  }

  @Post('tasks/:id/assign')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Assign a courier to a delivery task (Admin only)' })
  async assignDriver(
    @Param('id') id: string,
    @Body('driverId') driverId: string,
  ) {
    return this.deliveryService.assignDriver(id, driverId);
  }

  @Put('tasks/:id/status')
  @Roles(RoleType.DELIVERY, RoleType.ADMIN)
  @ApiOperation({ summary: 'Update delivery task status and proof notes (auto-advances rental lifecycle)' })
  async updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateDeliveryStatusDto,
  ) {
    return this.deliveryService.updateTaskStatus(id, req.user.id, req.user.roles, dto);
  }
}

