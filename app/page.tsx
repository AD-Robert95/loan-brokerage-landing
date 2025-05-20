export const metadata = {
  title: "실시간 대출상담하기 대출브라더스대부중개 2022-경기성남-0022-중개",
  description: "대출브라더스 대부중개 대출상담하기 믿을 수 있는 업체에서 상담하세요 직장인대환대출,무직자대환대출,채무통합대환대출을 전지역 어디서나 빠르게 상담이 가능해요",
  openGraph: {
    title: "실시간 대출상담하기 대출브라더스대부중개 2022-경기성남-0022-중개",
    description: "대출브라더스 대부중개 대출상담하기 믿을 수 있는 업체에서 상담하세요 직장인대환대출,무직자대환대출,채무통합대환대출을 전지역 어디서나 빠르게 상담이 가능해요",
    url: "https://loan-brokerage-landing.vercel.app/",
    images: [
      {
        url: "https://loan-brokerage-landing.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "대출브라더스 대표 이미지"
      }
    ],
    type: "website"
  }
};

import { Header } from "@/components/header";
import { FaqSection } from "@/components/faq-section";
import { MainClientSection } from "@/components/main-client-section";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header activeSection="hero" />
      <MainClientSection />
      <FaqSection />
    </div>
  );
}
