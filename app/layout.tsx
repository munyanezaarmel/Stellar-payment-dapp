/**
 * app/layout.tsx
 *
 * This is the ROOT LAYOUT — it wraps every page in your app.
 * Think of it like the "shell" of your website:
 * - Sets the HTML metadata (title, description)
 * - Imports global CSS
 * - Defines what wraps every page
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stellar Pay | XLM Payments on Testnet",
  description: "Send XLM on the Stellar testnet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="stars" aria-hidden="true" />
        <div aria-hidden="true" style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", opacity:0.25, backgroundImage:"linear-gradient(rgba(0,152,218,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,152,218,0.04) 1px, transparent 1px)", backgroundSize:"40px 40px" }} />
        <div aria-hidden="true" style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", background:"radial-gradient(ellipse 80% 50% at 50% -5%, rgba(0,152,218,0.13) 0%, transparent 70%)" }} />
        <div style={{ position:"relative", zIndex:10 }}>{children}</div>
      </body>
    </html>
  );
}