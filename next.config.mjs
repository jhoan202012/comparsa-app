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
};

export default nextConfig;
