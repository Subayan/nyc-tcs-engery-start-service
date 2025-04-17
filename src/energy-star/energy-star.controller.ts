import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { EnergyStarService } from './energy-star.service';

@Controller('energy-star')
export class EnergyStarController {
  constructor(private readonly energyStarService: EnergyStarService) {}

  @Get()
  getEnergyData() {
    return this.energyStarService.getEnergyData();
  }

  @Get('electricity-readings')
  getElectricityReadings() {
    return this.energyStarService.fetchAndSaveAllEnergyReadings();
  }

  @Post('map-building-to-energy-star')
  @HttpCode(200)
  mapBuildingToEnergyStar(@Body() body: { buildingId: string; url: string }) {
    return this.energyStarService.mapBuildingToEnergyStar(body.buildingId, body.url);
  }
}