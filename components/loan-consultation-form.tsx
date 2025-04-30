"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface LoanConsultationFormProps {
  isCompact?: boolean
  showPrivacyPolicy?: boolean
  onOpenPrivacyPolicy?: () => void
}

export function LoanConsultationForm({
  isCompact = false,
  showPrivacyPolicy = false,
  onOpenPrivacyPolicy,
}: LoanConsultationFormProps) {
  const [formData, setFormData] = useState({
    age: "",
    phone: "",
    region: "",
    isEmployed: "yes",
    loanAmount: "",
    privacyAgreement: false,
  })

  const [errors, setErrors] = useState({
    age: "",
    phone: "",
    region: "",
    loanAmount: "",
    privacyAgreement: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Handle numeric validation
    if ((name === "age" || name === "phone" || name === "loanAmount") && value !== "") {
      if (!/^\d+$/.test(value)) {
        return
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, isEmployed: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, privacyAgreement: e.target.checked }))
    if (errors.privacyAgreement) {
      setErrors((prev) => ({ ...prev, privacyAgreement: "" }))
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    if (!formData.age) {
      newErrors.age = "나이를 입력해주세요"
      valid = false
    }

    if (!formData.phone) {
      newErrors.phone = "전화번호를 입력해주세요"
      valid = false
    } else if (formData.phone.length < 10) {
      newErrors.phone = "유효한 전화번호를 입력해주세요"
      valid = false
    }

    if (!formData.region) {
      newErrors.region = "지역을 입력해주세요"
      valid = false
    }

    if (!formData.loanAmount) {
      newErrors.loanAmount = "대출 희망금액을 입력해주세요"
      valid = false
    }

    if (showPrivacyPolicy && !formData.privacyAgreement) {
      newErrors.privacyAgreement = "개인정보 수집에 동의해주세요"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate form submission
    try {
      // In a real application, you would send the data to your server here
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted && !isCompact) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 border border-gray-100">
        <div className="text-green-600 text-5xl mb-4 text-center">✓</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">상담 신청이 완료되었습니다</h3>
        <p className="text-gray-600 mb-6 text-center">빠른 시일 내에 연락드리겠습니다.</p>
        <Button
          onClick={() => {
            setIsSubmitted(false)
            setFormData({
              age: "",
              phone: "",
              region: "",
              isEmployed: "yes",
              loanAmount: "",
              privacyAgreement: false,
            })
          }}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          다시 작성하기
        </Button>
      </div>
    )
  }

  if (isCompact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[80px]">
          <Input
            id="age-compact"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="나이"
            className={`h-10 ${errors.age ? "border-red-300" : ""}`}
          />
        </div>

        <div className="flex-1 min-w-[120px]">
          <Input
            id="phone-compact"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="전화번호"
            className={`h-10 ${errors.phone ? "border-red-300" : ""}`}
          />
        </div>

        <div className="flex-1 min-w-[100px]">
          <Input
            id="region-compact"
            name="region"
            value={formData.region}
            onChange={handleChange}
            placeholder="지역"
            className={`h-10 ${errors.region ? "border-red-300" : ""}`}
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <RadioGroup
            value={formData.isEmployed}
            onValueChange={handleRadioChange}
            className="flex space-x-2 items-center h-10"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="yes" id="employed-yes-compact" />
              <Label htmlFor="employed-yes-compact" className="font-normal text-sm">
                재직(O)
              </Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="no" id="employed-no-compact" />
              <Label htmlFor="employed-no-compact" className="font-normal text-sm">
                미취업(X)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex-1 min-w-[120px]">
          <Input
            id="loanAmount-compact"
            name="loanAmount"
            value={formData.loanAmount}
            onChange={handleChange}
            placeholder="희망금액(만원)"
            className={`h-10 ${errors.loanAmount ? "border-red-300" : ""}`}
          />
        </div>

        {showPrivacyPolicy && (
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="checkbox"
              id="privacy-compact"
              checked={formData.privacyAgreement}
              onChange={handleCheckboxChange}
              className="rounded border-gray-300"
            />
            <Label htmlFor="privacy-compact" className="font-normal text-sm">
              개인정보취급동의
            </Label>
            <button type="button" onClick={onOpenPrivacyPolicy} className="text-xs text-blue-600 underline">
              자세히보기
            </button>
          </div>
        )}

        <div className="flex space-x-2">
          <Button type="submit" className="h-10 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
            상담신청
          </Button>
          <Button type="button" className="h-10 bg-yellow-500 hover:bg-yellow-600" disabled={isSubmitting}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
                fill="currentColor"
              />
            </svg>
            카톡상담
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 md:p-8 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">실시간 대출 상담</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="age" className="text-gray-700">
            나이 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="나이 (숫자만 입력)"
            className={errors.age ? "border-red-300" : ""}
          />
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>

        <div>
          <Label htmlFor="phone" className="text-gray-700">
            전화번호 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="전화번호 (숫자만 입력)"
            className={errors.phone ? "border-red-300" : ""}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="region" className="text-gray-700">
            지역 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            placeholder="거주 지역"
            className={errors.region ? "border-red-300" : ""}
          />
          {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
        </div>

        <div>
          <Label className="text-gray-700 block mb-2">
            재직 여부 <span className="text-red-500">*</span>
          </Label>
          <RadioGroup value={formData.isEmployed} onValueChange={handleRadioChange} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="employed-yes" />
              <Label htmlFor="employed-yes" className="font-normal">
                재직중 (O)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="employed-no" />
              <Label htmlFor="employed-no" className="font-normal">
                미취업 (X)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="loanAmount" className="text-gray-700">
            대출 희망금액 (만원) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="loanAmount"
            name="loanAmount"
            value={formData.loanAmount}
            onChange={handleChange}
            placeholder="금액 (숫자만 입력)"
            className={errors.loanAmount ? "border-red-300" : ""}
          />
          {errors.loanAmount && <p className="text-red-500 text-sm mt-1">{errors.loanAmount}</p>}
        </div>

        <Button type="submit" className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
          {isSubmitting ? "처리 중..." : "무료 상담 신청하기"}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-2">
          개인정보는 상담 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
        </p>
      </div>
    </form>
  )
}
