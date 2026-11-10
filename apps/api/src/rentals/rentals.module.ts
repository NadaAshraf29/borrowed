import { Module } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { PrismaService } from '../prisma.service';
import { SettingsModule } from '../settings/settings.module';
import { DressesModule } from '../dresses/dresses.module';

@Module({
  imports: [SettingsModule, DressesModule],
  controllers: [RentalsController],
  providers: [RentalsService, PrismaService],
  exports: [RentalsService],
})
export class RentalsModule {}

