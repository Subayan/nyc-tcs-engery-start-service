import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnergyStarRating, EnergyStarRatingDocument } from './schemas/energy-star-rating.schema';

@Injectable()
export class EnergyStarRatingRepository {
  constructor(
    @InjectModel(EnergyStarRating.name)
    private energyStarRatingModel: Model<EnergyStarRatingDocument>,
  ) {}

  async create(data: Partial<EnergyStarRating>): Promise<EnergyStarRatingDocument> {
    const newRating = new this.energyStarRatingModel(data);
    return newRating.save();
  }

  async bulkWrite(data: Partial<EnergyStarRating>[]): Promise<EnergyStarRatingDocument[]> {
    const result = await this.energyStarRatingModel.insertMany(data, { lean: true, ordered: false });
    return result as EnergyStarRatingDocument[];
  }

  async upsert(data: Partial<EnergyStarRating>): Promise<EnergyStarRatingDocument> {
    const { buildingId, energyStarPropertyId, year, month, ...updateData } = data;
    
    return this.energyStarRatingModel.findOneAndUpdate(
      { buildingId, energyStarPropertyId, year, month },
      { ...updateData, fetchedAt: new Date() },
      { new: true, upsert: true }
    ).exec();
  }

  async findAll(): Promise<EnergyStarRatingDocument[]> {
    return this.energyStarRatingModel.find().exec();
  }

  async findOne(query: any): Promise<EnergyStarRatingDocument | null> {
    return this.energyStarRatingModel.findOne(query).lean().exec();
  }

  async findById(id: string): Promise<EnergyStarRatingDocument | null> {
    return this.energyStarRatingModel.findById(id).exec();
  }

  async findByBuildingId(buildingId: string): Promise<EnergyStarRatingDocument[]> {
    return this.energyStarRatingModel
      .find({ buildingId })
      .sort({ year: -1, month: -1 })
      .exec();
  }

  async findLatestByBuildingIdAndYear(
    buildingId: string, 
    year: number
  ): Promise<EnergyStarRatingDocument | null> {
    return this.energyStarRatingModel
      .findOne({ 
        buildingId,
        year
      })
      .sort({ month: -1 })
      .exec();
  }

  async findLatestByBuildingId(buildingId: string): Promise<EnergyStarRatingDocument | null> {
    return this.energyStarRatingModel
      .findOne({ buildingId })
      .sort({ year: -1, month: -1 })
      .exec();
  }

  async update(
    id: string,
    data: Partial<EnergyStarRating>,
  ): Promise<EnergyStarRatingDocument | null> {
    return this.energyStarRatingModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<EnergyStarRatingDocument | null> {
    return this.energyStarRatingModel.findByIdAndDelete(id).exec();
  }

  async deleteByBuildingId(buildingId: string): Promise<any> {
    return this.energyStarRatingModel.deleteMany({ buildingId }).exec();
  }
} 