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
  },
  other: {
    'application/ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "대출브라더스대부중개",
      "alternateName": "대출브라더스",
      "url": "https://loan-brokerage-landing.vercel.app/",
      "logo": "https://loan-brokerage-landing.vercel.app/logo.png",
      "description": "대출브라더스 대부중개 대출상담하기 믿을 수 있는 업체에서 상담하세요 직장인대환대출,무직자대환대출,채무통합대환대출을 전지역 어디서나 빠르게 상담이 가능해요",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "금토로80번길 55, 판교 제2테크노밸리지 원시설용지D4-01, GT센트럴판교 8층 808호",
        "addressLocality": "금토동",
        "addressRegion": "경기도 성남시 수정구",
        "postalCode": "13487",
        "addressCountry": "KR"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "1668-0935",
          "contactType": "customer service",
          "areaServed": "KR",
          "availableLanguage": ["Korean"]
        },
        {
          "@type": "ContactPoint",
          "telephone": "031-729-2802",
          "contactType": "customer service",
          "areaServed": "KR",
          "availableLanguage": ["Korean"]
        }
      ],
      "identifier": [
        {
          "@type": "PropertyValue",
          "name": "대부중개업등록번호",
          "value": "2022-경기성남-0022-중개"
        },
        {
          "@type": "PropertyValue",
          "name": "사업자등록번호",
          "value": "463-46-00683"
        },
        {
          "@type": "PropertyValue",
          "name": "통신판매업신고번호",
          "value": "제2022-성남수정-1278호"
        }
      ],
      "founder": {
        "@type": "Person",
        "name": "권현수"
      },
      "areaServed": {
        "@type": "Country",
        "name": "대한민국"
      },
      "sameAs": [
        "https://facebook.com/대출브라더스",
        "https://blog.naver.com/대출브라더스",
        "https://instagram.com/대출브라더스"
      ]
    })
  }
};

import { Header } from "@/components/header";
import { FaqSection } from "@/components/faq-section";
import { MainClientSection } from "@/components/main-client-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header activeSection="hero" />
      <MainClientSection />
      <FaqSection />
      <Footer />
    </div>
  );
}
