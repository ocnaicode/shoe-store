import InvoiceClient from "./InvoiceClient";

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return {
    title: `Invoice #${orderId} | HOKO Lifestyle BD`,
    description: `Download invoice for order ${orderId}`,
  };
}

export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return (
    <div className="bg-[#fbfbfb] min-h-screen">
      <InvoiceClient orderId={orderId} />
    </div>
  );
}
