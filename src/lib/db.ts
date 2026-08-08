import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) {
    console.log("⚠️  MONGODB_URI not set - using fallback file storage");
    return null;
  }
  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected");
    return cached.conn;
  } catch (e) {
    console.error("❌ MongoDB connection failed:", e);
    return null;
  }
}

// File-based fallback helpers
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const COUPONS_FILE = path.join(DATA_DIR, "coupons.json");
const PROMOTIONS_FILE = path.join(DATA_DIR, "promotions.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");

export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getFallbackProducts() {
  ensureDataDir();
  if (fs.existsSync(PRODUCTS_FILE)) {
    try { return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8")); } catch {}
  }
  return null;
}

export function saveFallbackProducts(products: any) {
  ensureDataDir();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

export function getSettings() {
  ensureDataDir();
  const defaults = {
    cloudinary: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
      apiKey: process.env.CLOUDINARY_API_KEY || "",
      apiSecret: process.env.CLOUDINARY_API_SECRET || "",
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "hokolifestyle_preset",
    },
    siteName: "hokolifestylebd",
    currency: "BDT",
    siteSettings: {
      siteName: "HOKO Lifestyle BD",
      tagline: "Premium Shoe Store in Bangladesh",
      logoText: "HOKO",
      logoAccent: "LIFESTYLE",
      contact: {
        phone: "+880 1700-000000",
        phone2: "+880 1800-000000",
        email: "hello@hokolifestylebd.com",
        supportEmail: "support@hokolifestylebd.com",
        address: "House 12, Road 5, Gulshan-1, Dhaka - 1212, Bangladesh",
        hours: "10AM - 10PM (Everyday)",
        mapUrl: "https://maps.google.com/?q=Gulshan+Dhaka",
      },
      social: {
        facebook: "https://facebook.com/hokolifestylebd",
        instagram: "https://instagram.com/hokolifestylebd",
        youtube: "https://youtube.com/@hokolifestylebd",
        tiktok: "https://tiktok.com/@hokolifestylebd",
      },
      footer: {
        description: "বাংলাদেশের সবচেয়ে বিশ্বস্ত জুতার দোকান। Premium sneakers, formal, boots & sports shoes at best price. Cash on delivery available nationwide.",
        newsletterTitle: "GET 15% OFF YOUR FIRST ORDER",
        newsletterDesc: "Subscribe and get exclusive deals & early access to new collections",
        copyright: "© 2026 HOKO Lifestyle BD. All rights reserved. Made with ❤️ in Bangladesh.",
      },
      announcement: {
        enabled: true,
        text: "🚚 ফ্রি ডেলিভারি ৳3000+ অর্ডারে | Free Delivery on Orders over ৳3000",
      },
      theme: {
        primaryColor: "#0a0a0a",
        accentColor: "#f59e0b",
      },
    },
    socialLogin: {
      enabled: true,
      googleEnabled: true,
      facebookEnabled: false,
      googleClientId: process.env.GOOGLE_CLIENT_ID || "",
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      facebookAppId: process.env.FACEBOOK_APP_ID || "",
      facebookAppSecret: process.env.FACEBOOK_APP_SECRET || "",
    },
    whatsapp: {
      enabled: true,
      phoneNumber: "8801700000000",
      message: "Hello! Ami HOKO Lifestyle BD theke bolchi, ekti proshno chilo...",
      position: "bottom-right",
      popupMessage: "👋 Need help? Chat with us on WhatsApp!",
    },
    abandonedCart: {
      enabled: true,
      delayMinutes: 2,
      discountCode: "COMEBACK10",
      discountPercent: 10,
      message: "🎉 Apnar cart e product ache! Ekhon order korle 10% discount paben!",
      popupEnabled: true,
    },
    steadfast: {
      enabled: false,
      apiKey: "",
      secretKey: "",
      baseUrl: "https://portal.packzy.com/api/v1",
    },
    flashSale: {
      enabled: false,
      title: "⚡ FLASH SALE - Up to 50% OFF!",
      discountPercent: 30,
      endTime: new Date(Date.now() + 86400000).toISOString(),
      productIds: [] as string[],
    },
  };

  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
      // Deep merge defaults with saved
      return {
        ...defaults,
        ...saved,
        siteSettings: { ...defaults.siteSettings, ...(saved.siteSettings || {}), contact: { ...defaults.siteSettings.contact, ...(saved.siteSettings?.contact || {}) }, social: { ...defaults.siteSettings.social, ...(saved.siteSettings?.social || {}) }, footer: { ...defaults.siteSettings.footer, ...(saved.siteSettings?.footer || {}) }, announcement: { ...defaults.siteSettings.announcement, ...(saved.siteSettings?.announcement || {}) }, theme: { ...defaults.siteSettings.theme, ...(saved.siteSettings?.theme || {}) } },
        cloudinary: { ...defaults.cloudinary, ...(saved.cloudinary || {}) },
        socialLogin: { ...defaults.socialLogin, ...(saved.socialLogin || {}) },
        whatsapp: { ...defaults.whatsapp, ...(saved.whatsapp || {}) },
        abandonedCart: { ...defaults.abandonedCart, ...(saved.abandonedCart || {}) },
        steadfast: { ...defaults.steadfast, ...(saved.steadfast || {}) },
        flashSale: { ...defaults.flashSale, ...(saved.flashSale || {}) },
      };
    } catch {}
  }
  return defaults;
}

export function saveSettings(settings: any) {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export function getFallbackOrders() {
  ensureDataDir();
  if (fs.existsSync(ORDERS_FILE)) {
    try { return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8")); } catch {}
  }
  return [];
}

export function saveFallbackOrders(orders: any) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// Users
export function getFallbackUsers() {
  ensureDataDir();
  if (fs.existsSync(USERS_FILE)) {
    try { return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")); } catch {}
  }
  return [];
}
export function saveFallbackUsers(users: any) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Reviews
export function getFallbackReviews() {
  ensureDataDir();
  if (fs.existsSync(REVIEWS_FILE)) {
    try { return JSON.parse(fs.readFileSync(REVIEWS_FILE, "utf-8")); } catch {}
  }
  return [];
}
export function saveFallbackReviews(reviews: any) {
  ensureDataDir();
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
}

// Coupons
export function getFallbackCoupons() {
  ensureDataDir();
  if (fs.existsSync(COUPONS_FILE)) {
    try { return JSON.parse(fs.readFileSync(COUPONS_FILE, "utf-8")); } catch {}
  }
  // default coupons
  const defaults = [
    { code: "WELCOME10", discountType: "percent", discountValue: 10, minOrder: 1000, maxDiscount: 500, expiry: new Date(Date.now() + 30*86400000).toISOString(), usageLimit: 100, usedCount: 12, isActive: true, description: "New user 10% off" },
    { code: "EID2026", discountType: "percent", discountValue: 15, minOrder: 3000, maxDiscount: 1000, expiry: new Date(Date.now() + 15*86400000).toISOString(), usageLimit: 50, usedCount: 8, isActive: true, description: "Eid Special 15% off" },
    { code: "FLAT500", discountType: "fixed", discountValue: 500, minOrder: 5000, expiry: new Date(Date.now() + 7*86400000).toISOString(), usageLimit: 30, usedCount: 3, isActive: true, description: "Flat 500tk off on 5000+" },
  ];
  saveFallbackCoupons(defaults);
  return defaults;
}
export function saveFallbackCoupons(coupons: any) {
  ensureDataDir();
  fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2));
}

// Promotions (Popup)
export function getFallbackPromotions() {
  ensureDataDir();
  if (fs.existsSync(PROMOTIONS_FILE)) {
    try { return JSON.parse(fs.readFileSync(PROMOTIONS_FILE, "utf-8")); } catch {}
  }
  return [];
}
export function saveFallbackPromotions(promotions: any) {
  ensureDataDir();
  fs.writeFileSync(PROMOTIONS_FILE, JSON.stringify(promotions, null, 2));
}

// Categories
export function getFallbackCategories() {
  ensureDataDir();
  if (fs.existsSync(CATEGORIES_FILE)) {
    try { return JSON.parse(fs.readFileSync(CATEGORIES_FILE, "utf-8")); } catch {}
  }
  const defaults = [
    { _id: "1", name: "Sneakers", slug: "sneakers", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", description: "Comfortable sneakers for daily wear", count: 124, isActive: true },
    { _id: "2", name: "Formal", slug: "formal", image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=80", description: "Elegant formal shoes", count: 86, isActive: true },
    { _id: "3", name: "Boots", slug: "boots", image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80", description: "Rugged boots for adventure", count: 64, isActive: true },
    { _id: "4", name: "Sports", slug: "sports", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", description: "High performance sports shoes", count: 92, isActive: true },
    { _id: "5", name: "Casual", slug: "casual", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80", description: "Casual everyday shoes", count: 110, isActive: true },
    { _id: "6", name: "Loafers", slug: "loafers", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80", description: "Premium loafers", count: 45, isActive: true },
  ];
  saveFallbackCategories(defaults);
  return defaults;
}
export function saveFallbackCategories(categories: any) {
  ensureDataDir();
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}
