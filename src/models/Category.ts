import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  image: string;
  description?: string;
  count?: number;
  isActive: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, required: true },
    description: String,
    count: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
