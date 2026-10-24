/**
 * app/layout.tsx — wraps EVERY page
 * ---------------------------------------------------------------------------
 * OWNER: Frontend
 *
 * Already done for you:
 *   - Geist font, self-hosted from the `geist` npm package (no Google Fonts
 *     download at build time, so it builds even on bad venue Wi-Fi)
 *   - mobile-first container: content is capped at phone width (max-w-md)
 *     and centered, so it looks right on phones and isn't stretched on laptops
 *
 * TODO (Frontend):
 *   [ ] Update `metadata`: this is the preview text that shows when the
 *       link is pasted into iMessage, so it's our first impression
 *   [ ] If you build a toast/notification system, wrap {children} in its
 *       provider here so every page can use it
 */

import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carry: stop carrying your group project",
  description: "Paste your assignment, get a fair plan, and see who actually did the work.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-24">{children}</div>
      </body>
    </html>
  );
}
