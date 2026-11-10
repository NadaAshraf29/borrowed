import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { RoleType, PayoutStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Finance & Payouts')
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('owner/overview')
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  @ApiOperation({ summary: 'Get earnings, commissions, and payout history for logged-in owner' })
  async getOwnerOverview(@Request() req: any) {
    return this.financeService.getOwnerOverview(req.user.id);
  }

  @Get('admin/overview')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get platform-wide financial metrics (GMV, commission revenue, payouts)' })
  async getAdminOverview() {
    return this.financeService.getAdminOverview();
  }

  @Get('payouts')
  @Roles(RoleType.ADMIN, RoleType.OWNER)
  @ApiOperation({ summary: 'Get payouts ledger' })
  async getPayouts(@Request() req: any, @Query('status') status?: PayoutStatus) {
    const isOnlyOwner = !req.user.roles.includes(RoleType.ADMIN);
    const ownerId = isOnlyOwner ? req.user.id : undefined;
    return this.financeService.getPayouts(ownerId, status);
  }

  @Get('eligible-earnings')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'List earnings currently eligible for owner payouts (Admin only)' })
  async getEligibleEarnings(@Query('ownerId') ownerId?: string) {
    return this.financeService.getEligibleEarnings(ownerId);
  }

  @Post('payouts')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Process payout to dress owner (Admin only)' })
  async createPayout(
    @Request() req: any,
    @Body()
    body: {
      ownerId: string;
      earningIds: string[];
      method: string;
      notes?: string;
    },
  ) {
    return this.financeService.createPayout(
      req.user.id,
      body.ownerId,
      body.earningIds,
      body.method,
      body.notes,
    );
  }
}

