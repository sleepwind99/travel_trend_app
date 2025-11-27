import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 모든 HTTPS 도메인 허용 (개발용)
      },
    ],
    formats: ['image/webp', 'image/avif'], // 최적화된 포맷
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // 반응형 이미지 크기
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 작은 이미지 크기
  },
};

export default nextConfig;
