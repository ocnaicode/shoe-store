import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  orderId: string;
  items: any[];
  total: number;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  couponCode?: string;
  status: string;
  customer: { name: string; phone: string; email: string; address: string; city: string };
  paymentMethod: string;
  paymentStatus: string;
  paymentDetails?: {
    senderNumber?: string;
    trxId?: string;
    bkashNumber?: string;
    nagadNumber?: string;
  };
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    items: [Schema.Types.Mixed],
    total: Number,
    subtotal: Number,
    shipping: Number,
    discount: Number,
    couponCode: String,
    status: { type: String, default: "pending", enum: ["pending", "processing", "shipped", "delivered", "cancelled"] },
    customer: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
    },
    paymentMethod: String,
    paymentStatus: { type: String, default: "pending", enum: ["pending", "paid", "failed", "cod"] },
    paymentDetails: {
      senderNumber: String,
      trxId: String,
      bkashNumber: String,
      nagadNumber: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
