// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Next.js 16'da doğru olan ayar
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Dev origin uyarısını kaldırmak için (yenisi bu!)
  devIndicators: {
    appIsrStatus: false,
  },
};

export default nextConfig;
