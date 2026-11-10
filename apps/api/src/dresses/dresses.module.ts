import { Module } from '@nestjs/common';
import { DressesService } from './dresses.service';
import { DressesController } from './dresses.controller';
import { PrismaService } from '../prisma.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [DressesController],
  providers: [DressesService, PrismaService],
  exports: [DressesService],
})
export class DressesModule {}

