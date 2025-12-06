// app/layout.tsx

import "./globals.css";
import Providers from "./providers";
import NavBar from "./components/ui/NavBar";
import React from "react";

export const metadata = {
  title: "Arc Transfer — USDC & EURC on Arc",
  description:
    "Send USDC and EURC instantly on Arc Network. Sub-second finality, low fees, smooth UI.",
  openGraph: {
    title: "Arc Transfer — Fast USDC & EURC Transfers",
    description:
      "Instant USDC & EURC transfers on Arc Network. Lightning fast, secure, and predictable.",
    url: "https://arc-transfer.vercel.app",
    siteName: "Arc Transfer",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Arc Transfer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arc Transfer — USDC & EURC on Arc",
    description:
      "Send USDC & EURC instantly with sub-second finality — powered by Arc.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-shell">
            {/* BACKGROUND */}
            <div className="arc-lines">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="arc-line"></div>
              ))}
            </div>

            {/* NAVBAR (CLIENT COMPONENT) */}
            <NavBar />

            {/* MAIN CONTENT */}
            <main className="app-main">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
