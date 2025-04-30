import { Check } from "lucide-react"

export function LoanEligibilitySection() {
  const eligibilityItems = [
    {
      title: "대한민국 국적자, 만 20세 이상",
      description: "국내 거주 중인 대한민국 국적의 성인이라면 누구나 신청 가능합니다.",
    },
    {
      title: "직장인, 자영업자, 프리랜서, 주부",
      description: "다양한 직업군에 맞춘 대출 상품을 제공해 드립니다.",
    },
    {
      title: "무직자 중 자산 보유자 가능",
      description: "현재 소득이 없더라도 보유 자산이 있다면 대출 가능성이 있습니다.",
    },
    {
      title: "NICE 개인신용점수 550점 이상",
      description: "신용점수에 따라 다양한 대출 상품을 안내해 드립니다.",
    },
  ]

  return (
    <section id="eligibility" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">대출 가능 고객</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {eligibilityItems.map((item, index) => (
            <div key={index} className="bg-blue-50 rounded-lg p-6 transition-transform hover:transform hover:scale-105">
              <div className="flex items-start mb-4">
                <div className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
              </div>
              <p className="text-gray-600 ml-8">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
