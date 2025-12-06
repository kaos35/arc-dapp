/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
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

    config.module.rules.push({
      test: /thread-stream\/test\/.*\.(js|ts|mjs)$/,
      use: 'null-loader'
    });

    config.module.rules.push({
      test: /\.(md|txt|LICENSE|zip)$/,
      use: 'null-loader'
    });

    return config;
  },
};

export default nextConfig;
