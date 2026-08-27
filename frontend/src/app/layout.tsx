import type { Metadata } from "next";
import { Inter, Outfit, DM_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import QueryHandler from "@/lib/queryHandler";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const dmMono = DM_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "NutriPaste | Daily Nutrition & Calorie Tracker",
  description: "Track calories, macros, daily steps, and deficit with AI-powered nutrition estimation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, outfit.variable, dmMono.variable)}
    >
      <body className="min-h-full flex flex-col">
        <QueryHandler>{children}</QueryHandler>
      </body>
    </html>
  );
}
