/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    appDir: true,

    // 🚨 TURBOPACK'I TAMAMEN KAPAT — thread-stream hatası buradan çıkıyor
    turbo: false,
  },

  // 🚨 WalletConnect -> Pino -> Thread-stream zinciri için gerekli
  webpack: (config) => {
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding"
    );
    return config;
  },
};

export default nextConfig;
