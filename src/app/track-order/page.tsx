import TrackClient from "./TrackClient";

export const metadata = {
  title: "Track Your Order | HOKO Lifestyle BD",
  description: "Track your shoe order status at HOKO Lifestyle BD. Enter your order ID to see real-time updates.",
};

export default function TrackOrderPage() {
  return (
    <div className="bg-[#fbfbfb] min-h-screen">
      <TrackClient />
    </div>
  );
}
