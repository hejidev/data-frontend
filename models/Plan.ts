import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  provider: 'MTN' | 'GLO' | 'AIRTEL' | '9MOBILE';
  type: 'data' | 'airtime';
  dataSize: string;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months';
  price: number;
  isActive: boolean;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      enum: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'],
      required: true,
    },
    type: {
      type: String,
      enum: ['data', 'airtime'],
      required: true,
    },
    dataSize: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    durationUnit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'days',
    },
    price: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    features: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

const Plan: Model<IPlan> = mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);

export default Plan;
