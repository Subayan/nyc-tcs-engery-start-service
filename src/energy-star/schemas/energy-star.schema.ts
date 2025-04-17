import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EnergyStarDocument = EnergyStarMappingData & Document;

@Schema({ timestamps: true })
export class EnergyStarMappingData {
  @Prop({ required: true })
  buildingId: string;

  @Prop({ required: true })
  energyStarPropertyId: string;

  @Prop()
  url: string;

  @Prop()
  meters: {
    id: string;
    type: string;
  }[];
}

export const EnergyStarSchema = SchemaFactory.createForClass(EnergyStarMappingData); 