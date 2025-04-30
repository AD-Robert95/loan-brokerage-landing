import Link from "next/link"
import { Facebook, Instagram, FileText } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-gray-300 py-10 px-4">
      <div className="container mx-auto">
        {/* Regulatory Information */}
        <div className="mb-8 p-6 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">법적 고지사항</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-2">• 금리 연 20%이내, 연체이자율 연 20%이내</p>
              <p className="mb-2">• 취급 수수료 없음, 중개수수료 없음, 추가 비용 없음</p>
              <p className="mb-2">• 상환기간: 최단 61일 이상, 최대 12개월 (업체 상이)</p>
            </div>
            <div>
              <p className="mb-2">
                • 대출 총 비용 예시: 100만원을 12개월 기간 동안 이자 최대 연이율 20% 원리금균등상환 시 총 상환금액
                1,134,715원
              </p>
              <p className="mb-2">• 조기상환 수수료 없음</p>
              <p className="mb-2">• 과도한 대출은 신용등급 하락의 원인이 될 수 있습니다</p>
              <p className="mb-2">• 중개수수료 요구 및 수취는 불법입니다</p>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <p className="mb-2">
              <span className="font-medium">사이트명:</span> 대출브라더스
            </p>
            <p className="mb-2">
              <span className="font-medium">대부중개업 상호명:</span> 대출브라더스대부중개
            </p>
            <p className="mb-2">
              <span className="font-medium">대표자:</span> 권현수
            </p>
            <p className="mb-2">
              <span className="font-medium">대부중개업등록번호:</span> 2022-경기성남-0022-중개
            </p>
            <p className="mb-2">
              <span className="font-medium">소재지:</span> 경기도 성남시 수정구 금토로80번길 55, 판교 제2테크노밸리지
              원시설용지D4-01, GT센트럴판교 8층 808호 (금토동)
            </p>
          </div>
          <div>
            <p className="mb-2">
              <span className="font-medium">대부업등록기관:</span> 성남시지역경제과 031-729-2802
            </p>
            <p className="mb-2">
              <span className="font-medium">사업자등록번호:</span> 463-46-00683
            </p>
            <p className="mb-2">
              <span className="font-medium">통신판매업신고번호:</span> 제2022-성남수정-1278호
            </p>

            {/* Social Links */}
            <div className="flex space-x-4 mt-4">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://blog.naver.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FileText className="h-5 w-5" />
                <span className="sr-only">Official Blog</span>
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-4 text-center">
          <p className="text-sm">© {currentYear} 대출브라더스대부중개. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
