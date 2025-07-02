import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
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

  @Get('fetch-energy-star-rating')
  fetchEnergyStarRating(@Query('buildingId') buildingId: string) {
    console.log('fetchEnergyStarRating', buildingId);
    return this.energyStarService.fetchEnergyStarRating(buildingId);
  }

  @Get('ratings')
  getEnergyStarRatingsByBuildingId(@Query('buildingId') buildingId: string) {
    return this.energyStarService.getEnergyStarRatingsByBuildingId(buildingId);
  }

  @Get('ratings/latest')
  getLatestEnergyStarRating(@Query('buildingId') buildingId: string) {
    return this.energyStarService.getLatestEnergyStarRating(buildingId);
  }

  @Get('ratings/latest-by-year')
  getLatestEnergyStarRatingByYear(
    @Query('buildingId') buildingId: string,
    @Query('year') year: number,
  ) {
    return this.energyStarService.getLatestEnergyStarRatingByYear(buildingId, year);
  }
}