import mongoose, { Schema, Document } from "mongoose";

export interface IPromotion extends Document {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  displayDelay: number; // seconds after page load
}

const PromotionSchema = new Schema<IPromotion>(
  {
    title: { type: String, required: true },
    subtitle: String,
    image: { type: String, required: true },
    link: String,
    buttonText: String,
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    displayDelay: { type: Number, default: 3 },
  },
  { timestamps: true }
);

export default mongoose.models.Promotion || mongoose.model<IPromotion>("Promotion", PromotionSchema);
