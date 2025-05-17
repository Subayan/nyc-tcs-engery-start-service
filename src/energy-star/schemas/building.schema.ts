import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BuildingDocument = Building & Document;

@Schema({ timestamps: true })
export class Building {
  @Prop()
  block: string;

  @Prop()
  bbl: string;

  @Prop()
  lot: string;

  @Prop([String])
  bin: string[];

  @Prop()
  dofGfa: number;

  @Prop()
  streetNumber: string;

  @Prop()
  boro: string;

  @Prop()
  streetName: string;

  @Prop()
  address: string;

  @Prop()
  zipCode: string;

  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  propertyType: string;

  @Prop()
  fine2024: number;

  @Prop()
  ghg2022: number;

  @Prop()
  limit2024: number;

  @Prop()
  limit2030: number;

  @Prop()
  fine2030: number;

  @Prop()
  isViolationActive: boolean;

  @Prop([Object])
  violation: any[];

  @Prop()
  article32010: string;

  @Prop()
  article3209: string;

  @Prop()
  article321: string;

  @Prop()
  article320: string;

  @Prop()
  ll87RequiredYear: string;

  @Prop()
  ll87Required: boolean;

  @Prop()
  property_id: string;

  @Prop()
  actualEmission: number;

  @Prop()
  actualEmission2030_34: number;

  @Prop()
  actualEmissionPerSqFt: number;

  @Prop()
  actualEmissionPerSqFt2030_34: number;

  @Prop()
  allowedEmission: number;

  @Prop()
  allowedEmission2030_34: number;

  @Prop()
  allowedEmissionPerSqFt: number;

  @Prop()
  allowedEmissionPerSqFt2030_34: number;

  @Prop()
  fines_2024_29: number;

  @Prop()
  fines_2030_34: number;

  @Prop()
  list_of_all_property_use: string;

  @Prop()
  report_year: string;

  @Prop()
  totalGrossFt: number;

  @Prop()
  buildingId: string;

  @Prop()
  energyStarScore: number;

  @Prop()
  energyStarScorePro: number;
  
  @Prop()
  report_generation_date: Date;

  @Prop()
  natural_gas_use_therms: string;

  @Prop()
  water_use_all_water_sources: string;

  @Prop()
  weather_normalized_site_energy: string;

  @Prop()
  claimStatus: string;

  @Prop()
  district_steam_use_kbtu: string;

  @Prop()
  fuel_oil_2_use_kbtu: string;

  @Prop()
  fuel_oil_4_use_kbtu: string;

  @Prop([String])
  alternateAddress: string[];
}

export const BuildingSchema = SchemaFactory.createForClass(Building); 