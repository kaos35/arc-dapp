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
    // ❗ Turbopack kapalı — Vercel hatasının ana çözümü
    turbo: false,
  },

  webpack: (config) => {
    // ❗ Build sırasında problem çıkaran modülleri dışa alıyoruz
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding",
      "thread-stream"
    );

    return config;
  },
};

export default nextConfig;
