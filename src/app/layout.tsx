import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import StorefrontChrome from "@/components/StorefrontChrome";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "HOKO Lifestyle BD - Premium Shoe Store in Bangladesh",
    template: "%s | HOKO Lifestyle BD",
  },
  description:
    "বাংলাদেশের সেরা জুতার দোকান - HOKO Lifestyle BD. Premium sneakers, formal shoes, boots & sports shoes. Cash on delivery, 7 days return, free shipping over ৳3000. Shop now!",
  keywords: ["shoe store bangladesh", "sneakers bd", "formal shoes dhaka", "hokolifestylebd", "juta", "buy shoes online bd", "nike adidas bd"],
  authors: [{ name: "HOKO Lifestyle BD" }],
  creator: "HOKO Lifestyle BD",
  metadataBase: new URL("https://hokolifestylebd.com"),
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "https://hokolifestylebd.com",
    title: "HOKO Lifestyle BD - Premium Shoe Store",
    description: "Premium shoes at best price in Bangladesh. Sneakers, Formal, Boots, Sports.",
    siteName: "HOKO Lifestyle BD",
    images: [{ url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "HOKO Lifestyle BD", description: "Premium Shoe Store BD" },
  robots: { index: true, follow: true },
  verification: { google: "google-verification-code" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('hoko-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var th=t||(m?'dark':'light');if(th==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#ededed] transition-colors duration-300">
        <ThemeProvider>
          <StorefrontChrome />
          <main className="flex-1 bg-white dark:bg-[#0a0a0a]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
