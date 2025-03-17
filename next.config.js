/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },

  env:{
    URL_CALLBACK:process.env.URL_CALLBACK,
    NEXT_PUBLIC_API_URL:process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FRONTEND_URL:process.env.NEXT_PUBLIC_FRONTEND_URL
  }
};

module.exports = nextConfig;
