import type { Metadata, Viewport } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Carry",
  description: "Stop carrying your group.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <main className="mx-auto min-h-dvh w-full max-w-md px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}