import { Controller, Get, Put, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { RoleType } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'List all platform users (Admin only)' })
  async getAllUsers(@Query('role') role?: RoleType) {
    return this.usersService.getAllUsers(role);
  }

  @Put('admin/:id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Block or unblock user account (Admin only)' })
  async toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update profile and payout settings' })
  async updateProfile(@Request() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Save a new delivery or pickup address' })
  async addAddress(@Request() req: any, @Body() body: any) {
    return this.usersService.addAddress(req.user.id, body);
  }
}

