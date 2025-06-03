"use client"

import { useState } from "react"
import { LoanConsultationForm } from "@/components/loan-consultation-form"

interface BottomConsultationBarProps {
  onOpenPrivacyPolicy: () => void
}

export function BottomConsultationBar({ onOpenPrivacyPolicy }: BottomConsultationBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40 transition-all duration-300 ${
        isExpanded ? "h-auto" : "h-16"
      }`}
    >
      <div className="container mx-auto px-4">
        {isExpanded ? (
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">빠른 상담 신청</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close consultation form"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <LoanConsultationForm isCompact showPrivacyPolicy onOpenPrivacyPolicy={onOpenPrivacyPolicy} />
          </div>
        ) : (
          <div className="h-16 flex items-center justify-between">
            <div className="text-sm md:text-base font-medium">빠른 상담이 필요하신가요?</div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsExpanded(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                상담 신청하기
              </button>
              <a
                href="https://pf.kakao.com/_xdgxnvK/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FEE500] hover:bg-yellow-300 text-black px-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center transition-colors border border-gray-200"
                aria-label="카톡 문의"
              >
                카톡 문의
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
