import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnergyStarRepository } from './energy-star.repository';
import { EnergyStarMappingData } from './schemas/energy-star.schema';
import { ElectricityReadingRepository } from './electricity-reading.repository';
import { EnergyStarRatingRepository } from './energy-star-rating.repository';
import { EnergyStarRating } from './schemas/energy-star-rating.schema';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { BuildingRepository } from './building.repository';


const UTILITY_MAP = {
    'District Steam': 'steam',
    'Electric': 'electricity',
}

const UNIT_MAP = {
    'District Steam': 'kWh',
    'Electric': 'kWh',
}

@Injectable()
export class EnergyStarService {
  constructor(
    private configService: ConfigService,
    private energyStarRepository: EnergyStarRepository,
    private electricityReadingRepository: ElectricityReadingRepository,
    private energyStarRatingRepository: EnergyStarRatingRepository,
    private buildingRepository: BuildingRepository,
  ) {}



  async getEnergyData() {
    return this.energyStarRepository.findAll();
  }

  async createEnergyData(data: Partial<EnergyStarMappingData>) {
    return this.energyStarRepository.create(data);
  }

  async getEnergyDataById(id: string) {
    return this.energyStarRepository.findById(id);
  }

  async updateEnergyData(id: string, data: Partial<EnergyStarMappingData>) {
    return this.energyStarRepository.update(id, data);
  }

  async deleteEnergyData(id: string) {
    return this.energyStarRepository.delete(id);
  }

  async getEnergyStarRatingsByBuildingId(buildingId: string) {
    return this.energyStarRatingRepository.findByBuildingId(buildingId);
  }

  async getLatestEnergyStarRating(buildingId: string) {
    return this.energyStarRatingRepository.findLatestByBuildingId(buildingId);
  }

  async getLatestEnergyStarRatingByYear(buildingId: string, year: number) {
    return this.energyStarRatingRepository.findLatestByBuildingIdAndYear(buildingId, year);
  }


  async fetchAndSaveAllEnergyReadings() {
    // read all mapping data from the database and use cursor to iterate over the data
    let mappingData = await this.energyStarRepository.findAll();
    console.log(mappingData);
    for (let data of mappingData) {
      // fetch and save electricity readings
      console.log(data);
      for (let meter of data.meters) {
        await this.fetchAndSaveElectricityReadings(data.buildingId, meter.id, meter.type);
      }
    await this.fetchEnergyStarRating(data.buildingId)
    //   data.meters.map(async (meter: any) => {
    //     await this.fetchAndSaveElectricityReadings(data.buildingId, meter.id, meter.type);
    //   });
    }
  }

  async fetchEnergyStarRating(buildingId: string) {
    const apiUsername = process.env.ENERGY_STAR_USERNAME;
    const apiPassword = process.env.ENERGY_STAR_PASSWORD;
    
    let mappingData = await this.energyStarRepository.findOne({buildingId: buildingId});
    if (!mappingData) {
      console.log(`No mapping data found for building: ${buildingId}`);
      return;
    }
    
    let propertyId = mappingData.energyStarPropertyId;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const ratingsData: Partial<EnergyStarRating>[] = [];

    // Fetch data for the last 3 years
    for (let year = currentYear - 2; year <= currentYear; year++) {
      for (let month = 1; month <= 12; month++) {
        // Skip future months for current year
        if (year === currentYear && month > currentDate.getMonth() + 1) {
          continue;
        }

        try {
          // Check if we already have this data
          const existingRating = await this.energyStarRatingRepository.findOne({
            buildingId,
            energyStarPropertyId: propertyId,
            year,
            month
          });

          if (existingRating) {
            console.log(`Rating already exists for ${buildingId} - ${year}/${month}, skipping...`);
            continue;
          }

          const apiUrl = `${process.env.ENERGYSTAR_API_URL}/property/${propertyId}/metrics?year=${year}&month=${month}`;

          const response = await axios.get(apiUrl, {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64')}`,
              'PM-Metrics': 'score',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });

          const data = response.data;
          const xmlData = await parseStringPromise(data);
          
          if (xmlData?.propertyMetrics?.metric) {
            const metrics = xmlData.propertyMetrics.metric;
            const scoreMetric = metrics.find((metric: any) => metric.$.name === 'score');
            
                         if (scoreMetric && !isNaN(scoreMetric.value?.[0])) {
               const ratingData: Partial<EnergyStarRating> = {
                 buildingId,
                 energyStarPropertyId: propertyId,
                 year,
                 month,
                 score: parseFloat(scoreMetric.value[0]),
                 fetchedAt: new Date()
               };



              // Save the rating data
              await this.energyStarRatingRepository.upsert(ratingData);
              ratingsData.push(ratingData);
              
              console.log(`Saved Energy Star rating for ${buildingId} - ${year}/${month}: ${ratingData.score}`);
            }
          }

          // Add a small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          if (error.response?.status === 404) {
            console.log(`No data available for ${buildingId} - ${year}/${month}`);
          } else {
            console.error(`Error fetching energy star rating for ${buildingId} - ${year}/${month}:`, error.message);
          }
        }
      }
    }

    return ratingsData;
  }

  async fetchAndSaveElectricityReadings(buildingId: string, meterNumber: string, utilityType: string) {
    const apiUsername = process.env.ENERGY_STAR_USERNAME;
    const apiPassword = process.env.ENERGY_STAR_PASSWORD;

    const apiUrl = `${process.env.ENERGYSTAR_API_URL}/meter/${meterNumber}/consumptionData`;

    try {
      // Get the last reading date for this meter
      const lastReading = await this.electricityReadingRepository.findOne({
        buildingUuid: buildingId,
        submeterUuid: meterNumber
      });

      const lastReadTime = lastReading?.readTime;
      console.log(lastReadTime);
      // use axios to fetch the data
      // response is in xml format, so we need to parse it
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64')}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (response.status !== 200) {
        throw new Error(`Failed to fetch electricity readings: ${response.statusText}`);
      }

      const data = response.data;
      // parse the xml data
      const xmlData = await parseStringPromise(data);
    //   console.log(xmlData);
      // save the data to the database
      // format the data to be saved to the database based on the schema
      const formattedData = xmlData?.meterData?.meterConsumption
        ?.filter((reading: any) => {
          if (!lastReadTime) return true;
          const readTime = new Date(reading.startDate?.[0]);
          console.log(readTime, lastReadTime, readTime > lastReadTime);
          return readTime > lastReadTime;
        })
        ?.map((reading: any) => ({
          buildingUuid: buildingId,
          submeterUuid: meterNumber,
          reading: reading.usage?.[0],
          readTime: new Date(reading.startDate?.[0]),
          utilityType: UTILITY_MAP[utilityType],
          unit: UNIT_MAP[utilityType]
        }));

      if (formattedData?.length > 0) {
        return this.electricityReadingRepository.bulkWrite(formattedData);
      }
      return [];
    } catch (error) {
      console.error('Error fetching electricity readings:', error);
      throw error;
    }
  }

  async fetchMetersFromEnergyStar(propertyId: string) {
    const apiUsername = process.env.ENERGY_STAR_USERNAME;
    const apiPassword = process.env.ENERGY_STAR_PASSWORD;
    const apiUrl = `${process.env.ENERGYSTAR_API_URL}/property/${propertyId}/meter/list`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64')}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (response.status !== 200) {
        throw new Error(`Failed to fetch meters: ${response.statusText}`);
      }
      const data = response.data;
      const xmlData = await parseStringPromise(data);
      console.log("xmlData", xmlData);
      // save the data to the database
      // format the data to be saved to the database based on the schema
      if (!xmlData?.response) {
        return;
      }
      const formattedData = await Promise.all(xmlData?.response?.links[0]?.link?.map(async(reading: any) =>{ 
        let data = await this.fetchMeterDetails(reading.$.id);
        return data;
    }));
      return formattedData;
    } catch (error) {
      console.error('Error fetching meters:', error);
      throw error;
    }
  }

  async fetchMeterDetails( meterId: string) {
    const apiUsername = process.env.ENERGY_STAR_USERNAME;
    const apiPassword = process.env.ENERGY_STAR_PASSWORD;
    const apiUrl = `${process.env.ENERGYSTAR_API_URL}/meter/${meterId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64')}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (response.status !== 200) {
        throw new Error(`Failed to fetch meter details: ${response.statusText}`);
      }
      const data = response.data;
      const xmlData = await parseStringPromise(data);
      
      // Format the meter details based on the XML response
      const meterDetails = {
        id: xmlData?.meter?.id?.[0],
        type: xmlData?.meter?.type?.[0],

      };

      return meterDetails;
    } catch (error) {
      console.error('Error fetching meter details:', error);
      throw error;
    }
  }

  async mapBuildingToEnergyStar(buildingId: string, url: string) {
    // get the building data from the database
    // const building = await this.buildingRepository.findById(buildingId);
    // get the energy star data from the database
    let propertyId = url.split('/').pop();
    let data = {
        buildingId: buildingId,
        energyStarPropertyId: propertyId,
        url: url,
        meters: []
    }
    //fetch meters from the energy star api
    let meters = await this.fetchMetersFromEnergyStar(propertyId as string);
    data.meters = meters;
    let createdData = await this.energyStarRepository.create(data);
    return createdData;
  }
  
}
