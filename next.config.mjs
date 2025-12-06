const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // Turbopack’i %100 devre dışı bırak
  experimental: {
    turbo: {
      rules: {
        '*': false,
      },
    },
  },

  // Build'i Webpack'e zorluyoruz
  webpack(config, { isServer }) {
    config.infrastructureLogging = { level: 'error' };
    return config;
  },
};

export default nextConfig;
