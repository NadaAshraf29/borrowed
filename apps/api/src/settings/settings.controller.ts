import { Controller, Get, Put, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard, RolesGuard, Roles, Public } from '../auth/guards';
import { RoleType } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Platform Settings')
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get public platform settings (commission, timing offsets, policies)' })
  async getSettings() {
    return this.settingsService.getAllSettings();
  }

  @Public()
  @Get('cities')
  @ApiOperation({ summary: 'Get active delivery cities and delivery rates' })
  async getCities() {
    return this.settingsService.getCities();
  }

  @Get('admin/cities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all delivery cities including inactive ones (Admin only)' })
  async getAllCitiesAdmin() {
    return this.settingsService.getAllCitiesAdmin();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update platform policy settings (Admin only)' })
  async updateSettings(@Body() body: Record<string, string>, @Request() req: any) {
    return this.settingsService.updateBulkSettings(body, req.user.id);
  }

  @Put('cities/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update city delivery fee and active status (Admin only)' })
  async updateCityFee(
    @Param('id') id: string,
    @Body() body: { deliveryFee: number; isActive?: boolean },
  ) {
    return this.settingsService.updateCityFee(id, body.deliveryFee, body.isActive);
  }

  @Post('cities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new supported delivery city (Admin only)' })
  async createCity(
    @Body() body: { name: string; governorate: string; deliveryFee: number },
  ) {
    return this.settingsService.createCity(body.name, body.governorate, body.deliveryFee);
  }
}

