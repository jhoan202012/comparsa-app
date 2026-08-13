/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/*': ['./prisma/dev.db', './prisma/schema.prisma'],
  },
  allowedDevOrigins: [
    '10.101.4.219',
    '10.101.4.219:3000',
    'localhost:3000',
    '17e72d1502cbdc.lhr.life',
    '*.lhr.life'
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
