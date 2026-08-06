import { products } from "@/lib/data";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} - Buy at ৳${product.price} | HOKO Lifestyle BD`,
    description: product.description + ` Price ৳${product.price}. Cash on delivery available in Bangladesh. Sizes: ${product.sizes.join(", ")}`,
    keywords: [product.name, product.brand, product.category, "buy shoes bd", "hokolifestylebd"],
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0], width: 800, height: 800, alt: product.name }],
      type: "website",
    },
    alternates: { canonical: `https://hokolifestylebd.com/product/${product.slug}` },
  };
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const related = products.filter((p) => p.category === product.category && p._id !== product._id).slice(0, 4);

  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product._id,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      url: `https://hokolifestylebd.com/product/${product.slug}`,
      priceCurrency: "BDT",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "HOKO Lifestyle BD" },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductClient product={product} related={related} />
    </>
  );
}
