/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
        'canvas': 'commonjs canvas'
      });
    }
    return config;
  },
};

module.exports = nextConfig;
