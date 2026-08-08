import ShopClient from "./ShopClient";

export const metadata = {
  title: "Shop All Shoes | HOKO Lifestyle BD",
  description: "Shop premium sneakers, formal, boots & sports shoes at HOKO Lifestyle BD. Filter by size, price, brand & color. Cash on delivery available.",
};

export default function ShopPage() {
  return (
    <div className="bg-[#fbfbfb] dark:bg-zinc-950 min-h-screen">
      <ShopClient />
    </div>
  );
}
