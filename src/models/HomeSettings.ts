import mongoose, { Schema, Document } from "mongoose";

export interface IHomeSettings extends Document {
  heroSlides: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    desc: string;
    image: string;
    bg: string;
    accent: string;
    productName: string;
    productPrice: string;
    productImage: string;
    cta: string;
    isActive: boolean;
  }[];
  sections: {
    categories: { enabled: boolean; title: string; subtitle: string };
    featured: { enabled: boolean; title: string; subtitle: string };
    promo: { enabled: boolean };
    bestSellers: { enabled: boolean; title: string };
    newArrivals: { enabled: boolean; title: string; subtitle: string };
    brands: { enabled: boolean; title: string };
    whyChooseUs: { enabled: boolean; title: string };
    instagram: { enabled: boolean; title: string };
    testimonials: { enabled: boolean; title: string; subtitle: string };
  };
}

const HomeSettingsSchema = new Schema<IHomeSettings>(
  {
    heroSlides: [
      {
        badge: String,
        title: String,
        highlight: String,
        subtitle: String,
        desc: String,
        image: String,
        bg: String,
        accent: String,
        productName: String,
        productPrice: String,
        productImage: String,
        cta: String,
        isActive: { type: Boolean, default: true },
      },
    ],
    sections: {
      categories: { enabled: { type: Boolean, default: true }, title: String, subtitle: String },
      featured: { enabled: { type: Boolean, default: true }, title: String, subtitle: String },
      promo: { enabled: { type: Boolean, default: true } },
      bestSellers: { enabled: { type: Boolean, default: true }, title: String },
      newArrivals: { enabled: { type: Boolean, default: true }, title: String, subtitle: String },
      brands: { enabled: { type: Boolean, default: true }, title: String },
      whyChooseUs: { enabled: { type: Boolean, default: true }, title: String },
      instagram: { enabled: { type: Boolean, default: true }, title: String },
      testimonials: { enabled: { type: Boolean, default: true }, title: String, subtitle: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.HomeSettings || mongoose.model<IHomeSettings>("HomeSettings", HomeSettingsSchema);
