import { ArrowRight, FileText, CheckCircle, Phone, CreditCard } from "lucide-react"

export function LoanProcessSection() {
  const processSteps = [
    {
      icon: <FileText className="h-10 w-10 text-blue-600" />,
      title: "상담 신청",
      description: "간단한 정보 입력으로 무료 상담 신청",
    },
    {
      icon: <Phone className="h-10 w-10 text-blue-600" />,
      title: "전문 상담",
      description: "전문 상담사의 맞춤형 대출 상품 안내",
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-blue-600" />,
      title: "심사 및 승인",
      description: "신속한 심사 과정 및 승인 안내",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-blue-600" />,
      title: "대출 실행",
      description: "승인 후 빠른 입금 서비스",
    },
  ]

  return (
    <section id="process" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">대출 진행 과정</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {processSteps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-50 p-4 rounded-full mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>

              {/* Arrow between steps */}
              {index < processSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 -right-3 transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
