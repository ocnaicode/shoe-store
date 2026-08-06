import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  expiry: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  description?: string;
  isFlashSale?: boolean;
  flashEndTime?: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, required: true, enum: ["percent", "fixed"] },
    discountValue: { type: Number, required: true },
    minOrder: { type: Number, default: 0 },
    maxDiscount: Number,
    expiry: { type: Date, required: true },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    description: String,
    isFlashSale: Boolean,
    flashEndTime: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
