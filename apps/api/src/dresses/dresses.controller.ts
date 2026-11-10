import { Controller, Get, Post, Put, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { DressesService } from './dresses.service';
import { CreateDressDto, UpdateDressDto, ModerateDressDto, FilterDressesQuery } from './dto';
import { JwtAuthGuard, RolesGuard, Roles, Public } from '../auth/guards';
import { RoleType, DressStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dresses')
@Controller('dresses')
export class DressesController {
  constructor(private dressesService: DressesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Browse approved dresses with filters and pagination' })
  async findAll(@Query() query: FilterDressesQuery) {
    return this.dressesService.findAll(query);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get top trending and featured dresses for homepage' })
  async findFeatured() {
    return this.dressesService.findFeatured();
  }

  @Public()
  @Get(':id/availability')
  @ApiOperation({ summary: 'Check real-time dress availability for an occasion date' })
  async checkAvailability(
    @Param('id') id: string,
    @Query('occasionDate') occasionDate: string,
  ) {
    return this.dressesService.checkAvailability(id, occasionDate);
  }

  @Get('owner/mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dresses listed by the authenticated dress owner' })
  async getOwnerDresses(@Request() req: any) {
    return this.dressesService.getOwnerDresses(req.user.id);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all dresses for admin moderation' })
  async getAdminDresses(@Query('status') status?: DressStatus) {
    return this.dressesService.getAdminDresses(status);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get dress details by ID' })
  async findOne(@Param('id') id: string) {
    return this.dressesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List a new dress for free (submitted for moderation)' })
  async create(@Request() req: any, @Body() dto: CreateDressDto) {
    return this.dressesService.create(req.user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit dress details' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateDressDto,
  ) {
    return this.dressesService.update(id, req.user.id, req.user.roles, dto);
  }

  @Post(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject dress listing (Admin only)' })
  async moderate(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ModerateDressDto,
  ) {
    return this.dressesService.moderate(id, req.user.id, dto);
  }
}

