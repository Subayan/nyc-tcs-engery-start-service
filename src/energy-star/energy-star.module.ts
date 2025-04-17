import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnergyStarController } from './energy-star.controller';
import { EnergyStarService } from './energy-star.service';
import { EnergyStarRepository } from './energy-star.repository';
import { ElectricityReadingRepository } from './electricity-reading.repository';
import { EnergyStarMappingData, EnergyStarSchema } from './schemas/energy-star.schema';
import { ElectricityReading, ElectricityReadingSchema } from './schemas/electricity-reading.schema';

@Module({
  controllers: [EnergyStarController],
  imports: [
    MongooseModule.forFeature([
      { name: EnergyStarMappingData.name, schema: EnergyStarSchema },
      { name: ElectricityReading.name, schema: ElectricityReadingSchema },
    ]),
  ],
  providers: [EnergyStarService, EnergyStarRepository, ElectricityReadingRepository],
  exports: [EnergyStarService],
})
export class EnergyStarModule {}