/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://buildathon-genai-production.up.railway.app/api/:path*'
          : 'http://localhost:5000/api/:path*',
      },
    ];
  },
  output: 'standalone',
  swcMinify: true,
};

module.exports = nextConfig; 