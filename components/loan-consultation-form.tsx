"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { LoanFormData, LoanResponse } from '@/types/loan';
import type { Database } from '@/types/supabase';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const formSchema = z.object({
  age: z.number().min(18, '나이를 입력해주세요'),
  phone_number: z.string().regex(/^[0-9]{10,11}$/, '올바른 전화번호를 입력해주세요'),
  location: z.string().min(1, '지역을 입력해주세요'),
  loan_amount: z.number().min(1000000, '대출 금액을 입력해주세요'),
  employed: z.boolean(),
});

interface LoanConsultationFormProps {
  onSubmit: (data: LoanFormData) => Promise<LoanResponse>
}

export function LoanConsultationForm({ onSubmit }: LoanConsultationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [phoneForOtp, setPhoneForOtp] = useState("");
  const { register, handleSubmit, reset, formState: { errors }, getValues, setValue } = useForm<LoanFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employed: true,
      loan_amount: 1000000,
    }
  });

  const handleFormSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true);
    try {
      const formattedData: LoanFormData = {
        ...data,
        employed: typeof data.employed === 'string' 
          ? data.employed === 'true' 
          : !!data.employed
      };
      
      const result = await onSubmit(formattedData);
      if (result.success) {
        toast.success('상담 신청이 완료되었습니다.');
        reset();
      } else {
        throw new Error('상담 신청 중 오류가 발생했습니다.');
      }
    } catch (error) {
      toast.error('상담 신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 인증번호 발송
  const handleSendSms = async () => {
    const phone = getValues("phone_number");
    if (!/^[0-9]{10,11}$/.test(phone)) {
      toast.error("올바른 전화번호를 입력하세요.");
      return;
    }
    setVerifying(true);
    const res = await fetch("/api/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (data.success) {
      setSmsSent(true);
      setPhoneForOtp(phone);
      toast.success("인증번호가 발송되었습니다.");
    } else {
      toast.error(data.error || "문자 발송 실패");
    }
    setVerifying(false);
  };

  // 인증번호 검증
  const handleVerifyOtp = async () => {
    if (!otp || !phoneForOtp) return;
    setVerifying(true);
    const res = await fetch("/api/sms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneForOtp, code: otp }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("인증 성공");
      setValue("phone_number", phoneForOtp); // 폼에 인증된 번호 반영
    } else {
      toast.error(data.error || "인증 실패");
    }
    setVerifying(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">실시간 대출 상담</h2>
      <div className="space-y-4">
        <div>
          <Input
            {...register('age', { valueAsNumber: true })}
            type="number"
            placeholder="나이 *"
            className={`h-12 text-base ${errors.age ? 'border-red-500' : ''}`}
          />
          {errors.age && (
            <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
          )}
        </div>
        <div>
          <Input
            {...register('phone_number')}
            type="tel"
            placeholder="전화번호 * (숫자만 입력)"
            className={`h-12 text-base ${errors.phone_number ? 'border-red-500' : ''}`}
            disabled={smsSent}
          />
          <Button type="button" onClick={handleSendSms} disabled={verifying || smsSent} className="mt-2 w-full">
            {verifying ? '발송중...' : smsSent ? '인증번호 발송됨' : '인증번호 받기'}
          </Button>
          {errors.phone_number && (
            <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
          )}
        </div>
        {smsSent && (
          <div>
            <InputOTP maxLength={6} value={otp} onChange={setOtp} className="mb-2" disabled={verifying}>
              <InputOTPGroup>
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <Button type="button" onClick={handleVerifyOtp} disabled={verifying || otp.length !== 6} className="w-full">
              {verifying ? '인증중...' : '인증하기'}
            </Button>
          </div>
        )}
        <div>
          <Input
            {...register('location')}
            type="text"
            placeholder="지역 *"
            className={`h-12 text-base ${errors.location ? 'border-red-500' : ''}`}
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
          )}
        </div>
        <div>
          <select
            {...register('employed', {
              setValueAs: (value: string) => value === 'true'
            })}
            className={`w-full h-12 px-3 py-2 text-base bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.employed ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="true">재직중 (O)</option>
            <option value="false">미취업 (X)</option>
          </select>
          {errors.employed && (
            <p className="text-red-500 text-sm mt-1">{errors.employed.message}</p>
          )}
        </div>
        <div>
          <Input
            {...register('loan_amount', { valueAsNumber: true })}
            type="number"
            placeholder="대출 희망금액 * (원)"
            className={`h-12 text-base ${errors.loan_amount ? 'border-red-500' : ''}`}
          />
          {errors.loan_amount && (
            <p className="text-red-500 text-sm mt-1">{errors.loan_amount.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? '처리중...' : '무료 상담 신청하기'}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          개인정보는 상담 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
        </p>
      </div>
    </form>
  );
}

function formatKoreanTime(utcTimeString: string | null | undefined) {
  if (!utcTimeString) return '-';
  
  try {
    return new Date(utcTimeString).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('시간 변환 오류:', error);
    return '-';
  }
}
