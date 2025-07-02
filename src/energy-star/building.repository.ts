import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Building, BuildingDocument } from './schemas/building.schema';

@Injectable()
export class BuildingRepository {
  constructor(
    @InjectModel(Building.name)
    private buildingModel: Model<BuildingDocument>,
  ) {}

  async create(data: Partial<Building>): Promise<BuildingDocument> {
    const newBuilding = new this.buildingModel(data);
    return newBuilding.save();
  }

  async bulkWrite(data: Partial<Building>[]): Promise<BuildingDocument[]> {
    const result = await this.buildingModel.insertMany(data, { lean: true });
    return result as BuildingDocument[];
  }

  async findAll(): Promise<BuildingDocument[]> {
    return this.buildingModel.find().lean().exec();
  }

  async findOne(query: any): Promise<BuildingDocument | null> {
    return this.buildingModel.findOne(query).lean().exec();
  }

  async findById(id: string): Promise<BuildingDocument | null> {
    return this.buildingModel.findById(id).lean().exec();
  }

  async findByBuildingId(buildingId: string): Promise<BuildingDocument | null> {
    return this.buildingModel.findOne({ buildingId }).lean().exec();
  }

  async findByBBL(bbl: string): Promise<BuildingDocument | null> {
    return this.buildingModel.findOne({ bbl }).lean().exec();
  }

  async update(
    id: string,
    data: Partial<Building>,
  ): Promise<BuildingDocument | null> {
    return this.buildingModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
  }

  //update by buildingId
  async updateByBuildingId(buildingId: string, data: Partial<Building>): Promise<BuildingDocument | null> {
    return this.buildingModel.findOneAndUpdate({ buildingId }, data, { new: true }).lean().exec();
  }

  async delete(id: string): Promise<BuildingDocument | null> {
    return this.buildingModel.findByIdAndDelete(id).lean().exec();
  }

  async findByPropertyId(propertyId: string): Promise<BuildingDocument | null> {
    return this.buildingModel.findOne({ property_id: propertyId }).lean().exec();
  }

  async findByAddress(address: string): Promise<BuildingDocument[]> {
    return this.buildingModel
      .find({
        $or: [
          { address: { $regex: address, $options: 'i' } },
          { alternateAddress: { $elemMatch: { $regex: address, $options: 'i' } } },
        ],
      })
      .lean()
      .exec();
  }
} 