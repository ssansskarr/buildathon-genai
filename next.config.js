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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Accept, Authorization',
          },
        ],
      },
    ];
  },
  output: 'standalone',
  swcMinify: true,
  onDemandEntries: {
    // Keep pages in memory for longer in development
    maxInactiveAge: 25 * 1000,
    // Number of pages to be kept in memory
    pagesBufferLength: 4,
  },
  experimental: {
    // Better error handling and logging
    largePageDataBytes: 128 * 1000, // 128KB
  },
};

module.exports = nextConfig; 