import { Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LoanEligibilitySectionProps {
  onSubmit: (data: { name: string; phone: string; amount: number }) => Promise<{ success: boolean; error?: unknown }>
}

export function LoanEligibilitySection({ onSubmit }: LoanEligibilitySectionProps) {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      amount: Number(formData.get('amount'))
    }
    
    const result = await onSubmit(data)
    if (result.success) {
      alert('상담 신청이 완료되었습니다.')
      e.currentTarget.reset()
    } else {
      alert('상담 신청 중 오류가 발생했습니다.')
    }
  }

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

        <form onSubmit={handleSubmit} className="mt-12 max-w-md mx-auto">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">상담 신청하기</h3>
            <div className="space-y-4">
              <div>
                <Input
                  name="name"
                  type="text"
                  placeholder="이름 *"
                  required
                  minLength={2}
                  maxLength={20}
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="전화번호 * (숫자만 입력)"
                  required
                  pattern="^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Input
                  name="amount"
                  type="number"
                  placeholder="대출 희망금액 * (만원)"
                  required
                  min="1000000"
                  max="100000000"
                  className="h-12 text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                무료 상담 신청하기
              </Button>

              <p className="text-sm text-gray-500 mt-2">
                개인정보는 상담 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
