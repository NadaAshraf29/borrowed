import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CalculateRentalDto, CreateBookingDto, ProcessPaymentDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles, Public } from '../auth/guards';
import { RoleType, RentalStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Rentals')
@Controller('rentals')
export class RentalsController {
  constructor(private rentalsService: RentalsService) {}

  @Public()
  @Post('calculate')
  @ApiOperation({ summary: 'Calculate rental window, delivery date, return date, and itemized fees' })
  async calculate(@Body() dto: CalculateRentalDto) {
    return this.rentalsService.calculateRental(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate a new rental booking' })
  async create(@Request() req: any, @Body() dto: CreateBookingDto) {
    return this.rentalsService.createBooking(req.user.id, dto);
  }

  @Post(':id/pay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process payment and confirm booking' })
  async pay(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ProcessPaymentDto,
  ) {
    return this.rentalsService.processPayment(id, req.user.id, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current renter rentals filtered by tab' })
  async getMyRentals(
    @Request() req: any,
    @Query('tab') tab?: 'upcoming' | 'active' | 'completed' | 'cancelled',
  ) {
    return this.rentalsService.getMyRentals(req.user.id, tab);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all platform rentals for admin oversight' })
  async getAllAdmin(@Query('status') status?: RentalStatus) {
    return this.rentalsService.getAllAdminRentals(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get rental booking details, timeline, and delivery tasks' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.rentalsService.getBookingById(id, req.user.id, req.user.roles);
  }

  @Post(':id/return-request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit return pickup request for an active rental' })
  async requestReturn(
    @Param('id') id: string,
    @Request() req: any,
    @Body('notes') notes?: string,
  ) {
    return this.rentalsService.requestReturn(id, req.user.id, notes);
  }
}

