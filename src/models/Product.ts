import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Omit<Document, "isNew"> {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  brand: string;
  sizes: number[];
  colors: { name: string; hex: string }[];
  stock: number;
  rating: number;
  reviews: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  // Variable product support
  variants?: {
    size: number;
    color?: string;
    stock: number;
    price?: number;
    sku?: string;
  }[];
  sku?: string;
  weight?: number;
  material?: string;
  descriptionImages?: string[];
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    comparePrice: Number,
    images: [String],
    category: { type: String, required: true, index: true },
    brand: String,
    sizes: [Number],
    colors: [{ name: String, hex: String }],
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    isFeatured: Boolean,
    isNew: Boolean,
    isBestSeller: Boolean,
    variants: [
      {
        size: Number,
        color: String,
        stock: Number,
        price: Number,
        sku: String,
      },
    ],
    sku: String,
    weight: Number,
    material: String,
    descriptionImages: [String],
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
