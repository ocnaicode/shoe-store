"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import ProductCard from "./ProductCard";
import "swiper/css";
import "swiper/css/navigation";

export default function ProductSlider({ products, title }: { products: any[]; title?: string }) {
  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={16}
        slidesPerView={2}
        navigation
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="product-slider !pb-8"
      >
        {products.map((p) => (
          <SwiperSlide key={p._id || p.id}>
            <ProductCard product={p} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
