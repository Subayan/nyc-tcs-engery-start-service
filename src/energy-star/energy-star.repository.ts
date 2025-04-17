import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnergyStarMappingData, EnergyStarDocument } from './schemas/energy-star.schema';

@Injectable()
export class EnergyStarRepository {
  constructor(
    @InjectModel(EnergyStarMappingData.name)
    private energyStarModel: Model<EnergyStarDocument>,
  ) {}

  async create(data: Partial<EnergyStarMappingData>): Promise<EnergyStarDocument> {
    const newEntry = new this.energyStarModel(data);
    return newEntry.save();
  }

  async findAll(): Promise<EnergyStarDocument[]> {
    return this.energyStarModel.find().lean().exec();
  }

  async findById(id: string): Promise<EnergyStarDocument | null> {
    return this.energyStarModel.findById(id).exec();
  }

  async update(
    id: string,
    data: Partial<EnergyStarMappingData>,
  ): Promise<EnergyStarDocument | null> {
    return this.energyStarModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<EnergyStarDocument | null> {
    return this.energyStarModel.findByIdAndDelete(id).exec();
  }
} 