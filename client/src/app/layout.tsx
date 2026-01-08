import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeuraField - The Future of AI Video Generation",
  description: "Create stunning videos with 15+ state-of-the-art AI models. From OpenAI Sora 2 to Tencent HY-World, all in one platform.",
  keywords: ["AI video", "video generation", "Sora 2", "Veo 3.1", "Gen-4.5", "AI", "machine learning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
