import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalytics extends Document {
  date: Date;
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalRevenue: number;
    serverLoad: number;
    responseTime: number;
    errorRate: number;
  };
  trafficData: {
    requests: number;
    uniqueVisitors: number;
    bandwidth: number;
  };
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    metrics: {
      totalUsers: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      totalTransactions: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      serverLoad: { type: Number, default: 0 },
      responseTime: { type: Number, default: 0 },
      errorRate: { type: Number, default: 0 },
    },
    trafficData: {
      requests: { type: Number, default: 0 },
      uniqueVisitors: { type: Number, default: 0 },
      bandwidth: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Analytics: Model<IAnalytics> = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;
