// app/layout.tsx

import "./globals.css";
import Providers from "./providers";
import NavBar from "./components/ui/NavBar";

export const metadata = {
  title: "Arc Network",
  description: "Transfer USDC / EURC on Arc Testnet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-shell">

            {/* ============================
                BACKGROUND ANIMATION
            ============================== */}
            <div className="arc-lines">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="arc-line"></div>
              ))}
            </div>

            {/* NAVBAR */}
            <NavBar />

            {/* PAGE CONTENT */}
            <main className="app-main">
              {children}
            </main>

          </div>
        </Providers>
      </body>
    </html>
  );
}
