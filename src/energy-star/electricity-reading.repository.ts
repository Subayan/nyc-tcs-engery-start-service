import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ElectricityReading, ElectricityReadingDocument } from './schemas/electricity-reading.schema';

@Injectable()
export class ElectricityReadingRepository {
  constructor(
    @InjectModel(ElectricityReading.name)
    private electricityReadingModel: Model<ElectricityReadingDocument>,
  ) {}

  async create(data: Partial<ElectricityReading>): Promise<ElectricityReadingDocument> {
    const newReading = new this.electricityReadingModel(data);
    return newReading.save();
  }

  //bulk write
  async bulkWrite(data: Partial<ElectricityReading>[]): Promise<ElectricityReadingDocument[]> {
    const result = await this.electricityReadingModel.insertMany(data, { lean: true });
    return result as ElectricityReadingDocument[];
  }

  async findAll(): Promise<ElectricityReadingDocument[]> {
    return this.electricityReadingModel.find().exec();
  }

  async findOne(query: any): Promise<ElectricityReadingDocument | null> {
    return this.electricityReadingModel.findOne(query).sort({ readTime: -1 }).lean().exec();
  }

  async findById(id: string): Promise<ElectricityReadingDocument | null> {
    return this.electricityReadingModel.findById(id).populate('buildingId').exec();
  }

  async findByBuildingId(buildingId: string): Promise<ElectricityReadingDocument[]> {
    return this.electricityReadingModel.find({ buildingId }).populate('buildingId').exec();
  }

  async update(
    id: string,
    data: Partial<ElectricityReading>,
  ): Promise<ElectricityReadingDocument | null> {
    return this.electricityReadingModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('buildingId')
      .exec();
  }

  async delete(id: string): Promise<ElectricityReadingDocument | null> {
    return this.electricityReadingModel.findByIdAndDelete(id).exec();
  }
} 