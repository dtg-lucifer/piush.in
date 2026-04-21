import type React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const lilex = localFont({
  src: [
    {
      path: "../public/assets/fonts/variable/Lilex-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path:
        "../public/assets/fonts/variable/Lilex-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-lilex",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Piush Bose - SDE II",
  description:
    "SDE II crafting scalable backend systems and high-performance applications.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lilex.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
