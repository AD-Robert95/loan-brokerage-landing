"use client"

import { useEffect, useRef } from "react"

export function RealTimeBanner() {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sample real-time loan inquiries
  const inquiries = [
    "서울 강남구 | 3,000만원 | 승인완료",
    "경기 수원시 | 5,000만원 | 상담중",
    "부산 해운대구 | 2,000만원 | 승인완료",
    "대구 수성구 | 1,500만원 | 승인완료",
    "인천 연수구 | 4,000만원 | 상담중",
    "광주 서구 | 2,500만원 | 승인완료",
    "대전 유성구 | 3,500만원 | 상담중",
    "울산 남구 | 2,800만원 | 승인완료",
    "세종시 | 4,500만원 | 상담중",
    "경기 성남시 | 3,200만원 | 승인완료",
  ]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let position = 0

    const scroll = () => {
      position -= 1

      // Reset position when the first item is completely out of view
      const firstItemWidth = scrollContainer.querySelector("span")?.offsetWidth || 0
      if (position <= -firstItemWidth - 20) {
        // 20px for margin
        position = 0

        // Move the first item to the end
        const firstItem = scrollContainer.querySelector("span")
        if (firstItem) {
          scrollContainer.appendChild(firstItem.cloneNode(true))
          scrollContainer.removeChild(firstItem)
        }
      }

      scrollContainer.style.transform = `translateX(${position}px)`
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="bg-blue-600 text-white py-3 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center">
        <div className="font-semibold mr-4 whitespace-nowrap">실시간 대출 문의:</div>
        <div className="overflow-hidden relative flex-1">
          <div ref={scrollRef} className="flex whitespace-nowrap" style={{ willChange: "transform" }}>
            {inquiries.map((inquiry, index) => (
              <span key={index} className="mx-10 inline-block">
                {inquiry}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
