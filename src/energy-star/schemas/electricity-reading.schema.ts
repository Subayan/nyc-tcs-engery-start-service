import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ElectricityReadingDocument = ElectricityReading & Document;

@Schema({
  autoIndex: true,
})
export class ElectricityReading {
  @Prop({ required: true })
  buildingUuid: string;

  @Prop()
  submeterUuid?: string;

  @Prop({ required: true })
  reading: number; // electricity reading in wattHours (Wh)

  @Prop()
  unit: string;

  @Prop({ required: true })
  readTime: Date;

  @Prop({ required: true })
  utilityType: string;
}

export const ElectricityReadingSchema = SchemaFactory.createForClass(ElectricityReading);
ElectricityReadingSchema.index({ buildingUuid: 1, readTime: 1, submeterUuid: 1 }, { unique: true });

