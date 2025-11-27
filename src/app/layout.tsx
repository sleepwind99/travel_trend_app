import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 여행 플래너 | 맞춤형 여행지 추천",
  description: "Claude AI가 실시간 웹 검색을 통해 당신의 취향에 맞는 최신 트렌드 여행지를 추천해드립니다. SNS 핫플레이스부터 숨은 명소까지!",
  keywords: ["여행", "여행 추천", "AI 여행", "여행지", "핫플레이스", "여행 플래너", "맞춤 여행"],
  authors: [{ name: "AI Travel Planner" }],
  openGraph: {
    title: "AI 여행 플래너",
    description: "Claude AI가 추천하는 맞춤형 여행지",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 여행 플래너",
    description: "Claude AI가 추천하는 맞춤형 여행지",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
