import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  productId: string;
  productSlug: string;
  userId?: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  helpful: number;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: String, required: true, index: true },
    productSlug: { type: String, required: true },
    userId: String,
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [String],
    status: { type: String, default: "pending", enum: ["pending", "approved", "rejected"] },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
