import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    uploadPreset: string;
  };
  siteSettings: any;
  socialLogin: any;
  whatsapp: any;
  abandonedCart: any;
  steadfast: any;
  flashSale: any;
  delivery: any;
  payment: any;
  siteName: string;
  currency: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    cloudinary: {
      cloudName: String,
      apiKey: String,
      apiSecret: String,
      uploadPreset: String,
    },
    siteSettings: Schema.Types.Mixed,
    socialLogin: Schema.Types.Mixed,
    whatsapp: Schema.Types.Mixed,
    abandonedCart: Schema.Types.Mixed,
    steadfast: Schema.Types.Mixed,
    flashSale: Schema.Types.Mixed,
    delivery: Schema.Types.Mixed,
    payment: Schema.Types.Mixed,
    siteName: String,
    currency: String,
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
