import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { DressesModule } from './dresses/dresses.module';
import { RentalsModule } from './rentals/rentals.module';
import { DeliveryModule } from './delivery/delivery.module';
import { FinanceModule } from './finance/finance.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    DressesModule,
    RentalsModule,
    DeliveryModule,
    FinanceModule,
    SettingsModule,
    UsersModule,
    NotificationsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

