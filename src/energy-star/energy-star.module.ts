import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnergyStarController } from './energy-star.controller';
import { EnergyStarService } from './energy-star.service';
import { EnergyStarRepository } from './energy-star.repository';
import { ElectricityReadingRepository } from './electricity-reading.repository';
import { EnergyStarMappingData, EnergyStarSchema } from './schemas/energy-star.schema';
import { ElectricityReading, ElectricityReadingSchema } from './schemas/electricity-reading.schema';
import { Building, BuildingSchema } from './schemas/building.schema';
import { BuildingRepository } from './building.repository';

@Module({
  controllers: [EnergyStarController],
  imports: [
    MongooseModule.forFeature([
      { name: EnergyStarMappingData.name, schema: EnergyStarSchema },
      { name: ElectricityReading.name, schema: ElectricityReadingSchema },
      { name: Building.name, schema: BuildingSchema }
    ]),
  ],
  providers: [EnergyStarService, EnergyStarRepository, ElectricityReadingRepository, BuildingRepository],
  exports: [EnergyStarService],
})
export class EnergyStarModule {}