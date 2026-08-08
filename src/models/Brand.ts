import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: String,
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);
