/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nexusdev/shared'],
  webpack: (config) => {
    // Phaser 3 fallback handling for server builds
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
