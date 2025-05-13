"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { LoanConsultationForm } from "@/components/loan-consultation-form"
import type { LoanFormData, LoanResponse } from "@/types/loan"

const heroImages = [
  "/hero/hero1.jpg",
  "/hero/hero2.jpg",
  "/hero/hero3.jpg"
]

interface HeroSectionProps {
  onSubmit: (data: LoanFormData) => Promise<LoanResponse>
}

export function HeroSection({ onSubmit }: HeroSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (data: LoanFormData) => {
    try {
      const result = await onSubmit(data)
      if (result.success) {
        alert('상담 신청이 완료되었습니다.')
      } else {
        alert('상담 신청 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('상담 신청 중 오류가 발생했습니다.')
    }
  }

  return (
    <section id="hero" className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
      {/* Image Carousel */}
      <div className="absolute inset-0 w-full h-full">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" aria-hidden="true" />
            <Image
              src={image}
              alt={`Hero image ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              quality={85}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center md:items-start justify-between">
        {/* Hero Text */}
        <div className="text-white mb-8 md:mb-0 md:w-1/2 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            빠르고 안전한
            <br />
            맞춤형 대출 솔루션
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-lg mb-8">
            대출브라더스대부중개와 함께 최적의 대출 상품을 찾아보세요. 전문 중개사가 고객님의 상황에 맞는 최고의 조건을 제안해
            드립니다.
          </p>
          
          {/* Loan Information Table */}
          <div className="w-full max-w-lg">
            <div className="grid grid-cols-2 gap-4 text-white">
              <div className="border-b border-white/20 pb-2">
                <div className="text-sm opacity-80">대출 자격</div>
                <div className="font-medium">경제활동 가능한자</div>
              </div>
              <div className="border-b border-white/20 pb-2">
                <div className="text-sm opacity-80">대출 한도</div>
                <div className="font-medium">최대 1000만원</div>
              </div>
              <div className="border-b border-white/20 pb-2">
                <div className="text-sm opacity-80">대출 금리</div>
                <div className="font-medium">9 ~ 19.9%</div>
              </div>
              <div className="border-b border-white/20 pb-2">
                <div className="text-sm opacity-80">상환 기간</div>
                <div className="font-medium">최대 60개월</div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Form */}
        <div className="w-full md:w-5/12 lg:w-4/12">
          <LoanConsultationForm onSubmit={handleSubmit} />
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 mx-1 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentImageIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
