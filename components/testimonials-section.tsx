import { User } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "이**님",
      amount: "4,000만원 승인",
      type: "여성사업자대출 (40대 여성)",
      content: `소규모 의류샵을 운영하면서 계절마다 자금 압박이 있었는데, 대출브라더스를 통해 맞춤형 자영업자 대출을 소개받았습니다.
단순히 한도만 보는 게 아니라 제 매출 구조에 맞게 추천을 해주셔서 실질적으로 도움이 되는 자금 계획을 세울 수 있었어요.
특히 여성 창업자를 위한 우대 조건이 있다는 점도 좋았습니다.`,
      gender: "female",
    },
    {
      name: "박**님",
      amount: "9,000만원 승인",
      type: "법인사업자운영자금 (50대 남성)",
      content: `법인 자금을 마련하려고 여러 금융기관을 비교했지만, 대부분 까다로운 조건 때문에 진행이 어려웠습니다.
대출브라더스에서는 법인설립 6개월 차인 저에게도 가능한 대출안을 제시했고, 추가 담보 없이도 충분한 한도가 나와서 매우 만족합니다.
상담과 심사 과정이 투명하고, 무엇보다 속도가 빨라 사업에 지장 없이 대응할 수 있었어요.`,
      gender: "male",
    },
  ]

  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">실시간 대출문의 현황</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-start mb-4">
                <div
                  className={`rounded-full p-3 mr-4 flex-shrink-0 ${
                    testimonial.gender === "female" ? "bg-pink-100" : "bg-blue-100"
                  }`}
                >
                  <User className={`h-8 w-8 ${testimonial.gender === "female" ? "text-pink-600" : "text-blue-600"}`} />
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className="text-lg font-semibold mr-2">{testimonial.name}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {testimonial.amount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{testimonial.type}</p>
                  <div className="text-gray-700 whitespace-pre-line text-sm">{testimonial.content}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
