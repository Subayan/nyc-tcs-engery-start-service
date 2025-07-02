import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EnergyStarRatingDocument = EnergyStarRating & Document;

@Schema({ 
  timestamps: true,
  autoIndex: true,
})
export class EnergyStarRating {
  @Prop({ required: true })
  buildingId: string;

  @Prop({ required: true })
  energyStarPropertyId: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  month: number;

  @Prop({ required: true })
  score: number;

  @Prop()
  fetchedAt: Date;
}

export const EnergyStarRatingSchema = SchemaFactory.createForClass(EnergyStarRating);

// Create compound index for efficient querying
// EnergyStarRatingSchema.index({ 
//   buildingId: 1, 
//   energyStarPropertyId: 1, 
//   year: 1, 
//   month: 1 
// }, { unique: true });

// Index for efficient querying by building and time
// EnergyStarRatingSchema.index({ buildingId: 1, year: -1, month: -1 }); 