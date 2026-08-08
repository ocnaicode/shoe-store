export type Product = {
  _id: string;
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
  variants?: { size: number; stock: number; price?: number; sku?: string }[];
  sku?: string;
  material?: string;
  descriptionImages?: string[];
};

export const categories = [
  { name: "Sneakers", slug: "sneakers", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", count: 124 },
  { name: "Formal", slug: "formal", image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=80", count: 86 },
  { name: "Boots", slug: "boots", image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80", count: 64 },
  { name: "Sports", slug: "sports", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", count: 92 },
  { name: "Casual", slug: "casual", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80", count: 110 },
  { name: "Loafers", slug: "loafers", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80", count: 45 },
];

export const brands = ["Nike", "Adidas", "Puma", "Bata", "Apex", "Lotto", "Woodland", "HOKO"];

export const products: Product[] = [
  {
    _id: "1",
    name: "HOKO Air Max Revolution",
    slug: "hoko-air-max-revolution",
    description: "Premium lightweight sneaker with breathable mesh and responsive cushioning. Perfect for daily wear and light running. Designed in Bangladesh for ultimate comfort.",
    price: 4590,
    comparePrice: 5990,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    ],
    category: "sneakers",
    brand: "HOKO",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: [{ name: "Black/Orange", hex: "#111111" }, { name: "White", hex: "#ffffff" }, { name: "Red", hex: "#dc2626" }],
    stock: 42,
    rating: 4.8,
    reviews: 124,
    isFeatured: true,
    isBestSeller: true,
  },
  {
    _id: "2",
    name: "Urban Classic Formal Oxford",
    slug: "urban-classic-formal-oxford",
    description: "Handcrafted genuine leather formal shoe with elegant Oxford design. Perfect for office and formal occasions.",
    price: 6890,
    comparePrice: 8500,
    images: [
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80",
      "https://images.unsplash.com/photo-1614253429381-573710ca9e2a?w=800&q=80",
    ],
    category: "formal",
    brand: "Apex",
    sizes: [39, 40, 41, 42, 43],
    colors: [{ name: "Brown", hex: "#92400e" }, { name: "Black", hex: "#111111" }],
    stock: 28,
    rating: 4.7,
    reviews: 89,
    isFeatured: true,
  },
  {
    _id: "3",
    name: "Trail Blazer Hiking Boots",
    slug: "trail-blazer-hiking-boots",
    description: "Rugged waterproof hiking boots with Vibram sole and ankle support. Built for adventure.",
    price: 7990,
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80",
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80",
    ],
    category: "boots",
    brand: "Woodland",
    sizes: [40, 41, 42, 43, 44],
    colors: [{ name: "Olive", hex: "#57534e" }, { name: "Tan", hex: "#d6a77a" }],
    stock: 15,
    rating: 4.9,
    reviews: 56,
    isNew: true,
  },
  {
    _id: "4",
    name: "Velocity Pro Running Shoe",
    slug: "velocity-pro-running-shoe",
    description: "Ultra-light running shoe with carbon plate and energy-return foam. For serious runners.",
    price: 5290,
    comparePrice: 6990,
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
    ],
    category: "sports",
    brand: "Nike",
    sizes: [38, 39, 40, 41, 42, 43],
    colors: [{ name: "Blue", hex: "#2563eb" }, { name: "Neon Green", hex: "#22c55e" }],
    stock: 35,
    rating: 4.6,
    reviews: 203,
    isBestSeller: true,
  },
  {
    _id: "5",
    name: "Everyday Casual Canvas",
    slug: "everyday-casual-canvas",
    description: "Minimalist canvas slip-on for everyday comfort. Breathable and machine washable.",
    price: 2490,
    images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80"],
    category: "casual",
    brand: "Bata",
    sizes: [38, 39, 40, 41, 42],
    colors: [{ name: "Beige", hex: "#e7d5b8" }, { name: "Navy", hex: "#1e3a8a" }, { name: "White", hex: "#fff" }],
    stock: 60,
    rating: 4.5,
    reviews: 142,
    isFeatured: true,
  },
  {
    _id: "6",
    name: "Executive Leather Loafer",
    slug: "executive-leather-loafer",
    description: "Premium suede loafer with memory foam insole. Effortless style meets all-day comfort.",
    price: 5990,
    comparePrice: 7500,
    images: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80"],
    category: "loafers",
    brand: "Lotto",
    sizes: [39, 40, 41, 42],
    colors: [{ name: "Brown", hex: "#7c2d12" }, { name: "Black", hex: "#111" }],
    stock: 22,
    rating: 4.8,
    reviews: 67,
    isNew: true,
  },
  {
    _id: "7",
    name: "Street Pulse High-Top",
    slug: "street-pulse-high-top",
    description: "Iconic high-top sneaker with premium leather and signature air cushion.",
    price: 6490,
    images: ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80"],
    category: "sneakers",
    brand: "Adidas",
    sizes: [40, 41, 42, 43, 44],
    colors: [{ name: "White/Black", hex: "#fff" }, { name: "Black", hex: "#000" }],
    stock: 30,
    rating: 4.7,
    reviews: 98,
    isBestSeller: true,
  },
  {
    _id: "8",
    name: "Flex Sports Trainer",
    slug: "flex-sports-trainer",
    description: "Cross-training shoe with lateral support and flexible sole for gym and training.",
    price: 3890,
    images: ["https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&q=80"],
    category: "sports",
    brand: "Puma",
    sizes: [38, 39, 40, 41, 42],
    colors: [{ name: "Grey", hex: "#6b7280" }, { name: "Orange", hex: "#f97316" }],
    stock: 45,
    rating: 4.4,
    reviews: 76,
    isFeatured: true,
  },
];

export type Order = {
  id: string;
  items: { productId: string; name: string; price: number; quantity: number; size: number; image: string }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  customer: { name: string; phone: string; email: string; address: string };
  paymentMethod: string;
  createdAt: string;
};
