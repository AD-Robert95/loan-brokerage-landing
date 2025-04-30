"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqs = [
    {
      question: "신용등급이 낮아도 대출이 가능한가요?",
      answer:
        "네, 가능합니다. 신용등급이 낮더라도 다양한 대출 상품이 있으며, 고객님의 상황에 맞는 최적의 대출 상품을 찾아드립니다. 다만, 신용등급에 따라 대출 한도와 금리 조건이 달라질 수 있습니다.",
    },
    {
      question: "대출 승인까지 시간이 얼마나 걸리나요?",
      answer:
        "대출 승인 시간은 금융기관과 대출 상품에 따라 다르지만, 일반적으로 상담 후 필요 서류 제출 시 최소 1시간에서 최대 1~2일 내에 승인 여부를 확인하실 수 있습니다. 급전이 필요한 경우 당일 승인 가능한 상품도 안내해 드립니다.",
    },
    {
      question: "중개 수수료가 발생하나요?",
      answer:
        "아니요, 저희 대출브라더스대부중개는 어떠한 경우에도 고객님으로부터 중개 수수료를 받지 않습니다. 중개 수수료 요구 및 수취는 불법이며, 모든 상담 및 중개 서비스는 무료로 제공됩니다.",
    },
    {
      question: "어떤 서류가 필요한가요?",
      answer:
        "기본적으로 신분증과 소득증빙서류(근로소득자의 경우 재직증명서, 급여명세서 등)가 필요합니다. 자영업자는 사업자등록증, 소득금액증명원 등이 필요할 수 있습니다. 정확한 필요 서류는 상담 시 안내해 드립니다.",
    },
    {
      question: "대출 상환 방식은 어떻게 되나요?",
      answer:
        "일반적으로 원리금균등상환, 원금균등상환, 만기일시상환 방식이 있으며, 대출 상품과 고객님의 상황에 맞게 선택하실 수 있습니다. 각 상환 방식의 장단점과 총 상환금액에 대해 상세히 안내해 드립니다.",
    },
  ]

  return (
    <section id="faq" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className="text-lg font-medium text-gray-800">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </button>
              <div
                className={`px-4 pb-4 transition-all duration-300 ${
                  openIndex === index ? "block opacity-100" : "hidden opacity-0"
                }`}
              >
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
