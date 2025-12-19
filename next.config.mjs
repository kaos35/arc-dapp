/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    turbo: {}, // ← boş obje, Next bunu kabul ediyor
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        child_process: false,
        worker_threads: false,
      };
    }

    return config;
  },
};

export default nextConfig;
