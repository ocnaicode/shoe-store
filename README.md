# HOKO Lifestyle BD - Premium Shoe Store E-commerce

**Next.js 16 + MongoDB + Cloudinary** দিয়ে তৈরি Complete Professional Shoe Store

### 🌐 Live Preview
- Dev Server চলছে: `http://localhost:3000`
- Preview URL: https://3000-XXXX.e2b.app (Arena Live Preview দেখুন)

### ✨ Features Implemented

#### 🏠 **Home Page** (`/`)
- Hero Section (New Collection 2026, 40% OFF, floating product card)
- Category Grid (6 categories: Sneakers, Formal, Boots, Sports, Casual, Loafers)
- Featured Products / Trending Now
- Promo Banners (Air Max Collection + Formal Elegance)
- Best Sellers
- New Arrivals (Black theme)
- Trusted Brands strip
- Why Choose Us (3 features)
- Instagram Feed
- SEO Optimized with JSON-LD Structured Data

#### 🛍️ **Shop Page** (`/shop`)
- **Left Sidebar Filters** (Sticky):
  - Categories (All + 6 types)
  - Price Range (slider + preset buttons ৳0-3000, 3000-5000, etc)
  - Brands (Nike, Adidas, Puma, Bata, Apex, Lotto, Woodland, HOKO)
  - Sizes (38-45 grid)
  - Colors (6 colors)
  - Clear All
- Sort: Featured, Newest, Price Low-High, High-Low, Rating
- Product Grid (2/3 columns responsive)
- Pagination mock

#### 👟 **Product Page** (`/product/[slug]`)
- Image Gallery (main + thumbnails, Cloudinary URLs)
- Badges (NEW, BESTSELLER, % OFF)
- Rating, Stock Badge
- Price with comparePrice & discount
- Color selector (circles)
- Size selector (EU grid)
- Quantity + Add to Cart + Buy Now (Amber)
- Secure checkout badge
- Tabs: Description / Reviews (3 mock) / Shipping & Returns
- Related Products (same category)
- **SEO**: Dynamic metadata, canonical URL, OpenGraph, JSON-LD Product schema (for Google ranking)
- Wishlist toggle

#### 🛒 **Cart** (`/cart`)
- Cart items with image, size, color, qty +/- , remove
- Order Summary (subtotal, shipping, discount, total)
- Free shipping progress bar (৳3000 threshold)
- Coupon input
- Buyer Protection box

#### 💳 **Checkout** (`/checkout`)
- 3-step indicator
- Contact form (Name, Phone, Email, Address, City/Area)
- Payment Methods: COD (Most Popular), bKash, Nagad, Card
- Order summary sticky
- Places order → saves to MongoDB (or fallback JSON) + localStorage
- Redirects to `/track-order?orderId=HOKOxxxx&success=1`

#### 📦 **Order Tracking** (`/track-order`)
- Search by Order ID
- Success banner after checkout
- Status stepper (Pending → Processing → Shipped → Delivered)
- Order details (items, total, payment, address)
- Support info

#### 👤 **Customer Dashboard** (`/dashboard`)
- Sidebar: My Orders, Wishlist, Addresses, Profile
- Orders history (from API + localStorage)
- Wishlist (Zustand)
- Addresses (mock + add)
- Profile settings

#### 🔧 **Admin Panel** (`/admin`)
- **Layout**: Black sidebar, mobile responsive
- **Dashboard** (`/admin`): Stats (Products, Orders, Revenue, Customers), Recent Orders table, Quick Actions, Top Selling
- **Products** (`/admin/products`):
  - List table with image, name, category, price, stock, edit/delete
  - **Add New Product** form with Cloudinary Upload
    - Fields: Name, Brand, Price, Compare Price, Category, Stock, Sizes, Description
    - Image upload via `/api/upload` → Cloudinary (fallback base64 if not configured)
    - Preview grid with remove
    - Saves via `/api/products` (MongoDB or fallback file)
- **Orders** (`/admin/orders`):
  - Filter by status (All, Pending, Processing, Shipped, Delivered, Cancelled)
  - Order cards with customer, items, total
  - Update status buttons (patch to `/api/orders` + localStorage)
  - Call Customer
- **Settings** (`/admin/settings`):
  - **☁️ Cloudinary Configuration Form** (MAIN REQUIREMENT):
    - Inputs: Cloud Name, API Key, API Secret, Upload Preset
    - Save to `/api/cloudinary-config` → `data/settings.json`
    - How-to guide (cloudinary.com dashboard)
    - Test Upload (choose image → verifies credentials)
    - Status indicators
  - Site Settings (name, email, currency)
  - SEO Status (Sitemap, Robots, JSON-LD, Meta Tags - all ✅)
  - MongoDB Config guide

### 🗄️ Database (MongoDB)
- **Models**: `Product`, `Order` (Mongoose)
- **Connection**: `src/lib/db.ts` → `connectDB()` with caching
- **Fallback**: If `MONGODB_URI` not set, uses file storage in `/data/*.json` (products.json, orders.json, settings.json) - so site works without DB
- **Env**: Set `MONGODB_URI=mongodb+srv://...` in `.env.local` and restart

### ☁️ Cloudinary
- **SDK**: `cloudinary` v2
- **Config**: `src/lib/cloudinary.ts` → reads from env OR admin settings OR test form
- **Upload API**: `POST /api/upload` (FormData file) → uploads to folder `hokolifestylebd`
- **Admin Config**: Stored in `data/settings.json` via `/api/cloudinary-config`
- **Fallback**: If not configured, returns base64 Data URL so UI still works (with warning)

### 🔍 SEO (Google Ranking)
- **Metadata** per page (title template, description, keywords, authors)
- **OpenGraph & Twitter** cards
- **JSON-LD**: 
  - Home: ShoeStore schema
  - Product: Product schema with Offer + AggregateRating
  - Footer: Organization schema
- **Sitemap**: `src/app/sitemap.ts` → auto includes all product URLs (`/sitemap.xml`)
- **Robots**: `src/app/robots.ts` → allows `/`, disallows `/admin`, `/api`
- **Canonical URLs** per product
- **Semantic HTML**, fast images (next/image with remotePatterns)

### 🛠️ Tech Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript, Tailwind CSS v4
- Mongoose, Cloudinary, Zustand (cart/wishlist), React Icons

### 📁 Project Structure
```
src/
  app/
    layout.tsx, page.tsx (Home)
    shop/page.tsx + ShopClient.tsx
    product/[slug]/page.tsx + ProductClient.tsx
    cart/page.tsx
    checkout/page.tsx
    dashboard/page.tsx
    track-order/page.tsx + TrackClient.tsx
    admin/layout.tsx, page.tsx, products/page.tsx, orders/page.tsx, settings/page.tsx
    api/products, api/orders, api/upload, api/cloudinary-config
    sitemap.ts, robots.ts
    globals.css
  components/
    Navbar.tsx, Footer.tsx, Hero.tsx, ProductCard.tsx
  lib/
    data.ts (mock products), db.ts, cloudinary.ts, utils.ts, store.ts (Zustand)
  models/
    Product.ts, Order.ts
data/
  settings.json, products.json, orders.json (auto-created fallback)
```

### 🚀 Setup Instructions

1. **Install**: `npm install`
2. **Env**: Copy `.env.example` to `.env.local` and fill:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hokolifestylebd
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=hokolifestyle_preset
   ```
   - Or leave empty and configure via **Admin → Settings** after running
3. **Run**: `npm run dev` → http://localhost:3000
4. **Build**: `npm run build`

### 🔑 Admin Access
- URL: `/admin`
- No auth yet (add NextAuth if needed) - direct access for demo
- **Cloudinary Setup**: Go to `/admin/settings` → Fill Cloud Name, API Key, Secret → Save → Test Upload

### 📱 Test Flow
1. Home → Shop → Filter → Product → Select Size/Color → Add to Cart → Cart → Checkout → Fill Form → Place Order → Track Order → Check Dashboard → Admin → Orders → Update Status → Track again to see live update

### 🎨 Design Notes
- Colors: Black (#0a0a0a) + Amber (#f59e0b / #ff6b00) + Gray
- Fonts: Inter, Geist
- Rounded-2xl/3xl, bold typography, premium shoe store vibe
- Fully Responsive (mobile filter toggle, etc)

---
Made for **hokolifestylebd** • Bangladesh's Premium Shoe Store
# shoe-store
