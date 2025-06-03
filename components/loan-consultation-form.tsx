"use client"

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { LoanFormData, LoanResponse } from '@/types/loan';
import type { Database } from '@/types/supabase';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  age: z.preprocess(
    // 입력값을 숫자로 변환 시도
    (val) => {
      const processed = Number(val);
      return isNaN(processed) ? undefined : processed;
    },
    // 숫자 검증 및 한글 오류 메시지 표시
    z.number({
      required_error: "나이를 입력해주세요",
      invalid_type_error: "나이는 숫자만 기입해주세요"
    }).min(18, '18세 이상 입력해주세요').max(100, '유효한 나이를 입력해주세요')
  ),
  phone_number: z.string().regex(/^[0-9]{10,11}$/, '올바른 전화번호를 입력해주세요'),
  location: z.string().min(1, '지역을 입력해주세요'),
  loan_amount: z.preprocess(
    // 입력값을 숫자로 변환 시도 (만원 단위를 원 단위로 변환)
    (val) => {
      const processed = Number(val);
      return isNaN(processed) ? undefined : processed * 10000; // 만원 단위로 입력받아 원 단위로 변환
    },
    z.number({
      required_error: "대출 금액을 입력해주세요",
      invalid_type_error: "대출 금액은 숫자만 기입해주세요"
    }).positive('대출 금액은 양수만 가능합니다').min(100, '최소 100만원 이상 입력해주세요')
  ),
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
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [timer, setTimer] = useState(0); // 인증 타이머(초)
  const { register, handleSubmit, reset, formState: { errors }, getValues, setValue } = useForm<LoanFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employed: true,
      loan_amount: 100,
    }
  });

  // 인증 타이머 관리
  useEffect(() => {
    if (isPhoneVerified) {
      setTimer(0);
      setSmsSent(false);
      return;
    }
    if (smsSent && timer > 0) {
      const id = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
    if (timer === 0 && smsSent) {
      setSmsSent(false);
    }
  }, [smsSent, timer, isPhoneVerified]);

  const handleFormSubmit = async (data: LoanFormData) => {
    if (!isPhoneVerified) {
      toast.error('전화번호 인증이 필요합니다.');
      return;
    }
    
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
        // 인증 상태 초기화
        setSmsSent(false);
        setOtp("");
        setPhoneForOtp("");
        setIsPhoneVerified(false);
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
      setTimer(180); // 3분 타이머 시작
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
    try {
      const res = await fetch("/api/sms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneForOtp, code: otp }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("인증 성공");
        setValue("phone_number", phoneForOtp); // 폼에 인증된 번호 반영
        setIsPhoneVerified(true); // 인증 상태 업데이트
      } else {
        toast.error(data.error || "인증 실패");
      }
    } catch (error) {
      toast.error("인증 처리 중 오류가 발생했습니다.");
      console.error("인증 오류:", error);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">실시간 대출 상담</h2>
      <div className="space-y-4">
        <div>
          <Input
            {...register('age', { 
              valueAsNumber: true,
              onChange: (e) => {
                // 숫자만 허용하는 정규식으로 검증
                const value = e.target.value;
                if (value && !/^\d*$/.test(value)) {
                  e.target.value = value.replace(/[^\d]/g, '');
                }
              }
            })}
            type="text"
            placeholder="나이 *"
            className={`h-12 text-base ${errors.age ? 'border-red-500' : ''}`}
            maxLength={3}
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
          <Button 
            type="button" 
            onClick={handleSendSms} 
            disabled={verifying || smsSent || isPhoneVerified || timer > 0} 
            className="mt-2 w-full"
          >
            {verifying 
              ? '발송중...' 
              : isPhoneVerified 
                ? '인증완료' 
                : smsSent && timer > 0
                  ? `재발송 (${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')})`
                  : '인증번호 받기'}
          </Button>
          {timer > 0 && !isPhoneVerified && (
            <p className="text-xs text-gray-500 mt-1">인증번호 유효시간: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>
          )}
          {errors.phone_number && (
            <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
          )}
        </div>
        {smsSent && !isPhoneVerified && (
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
        {isPhoneVerified && (
          <div className="bg-green-50 text-green-600 p-2 rounded-md text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            전화번호 인증이 완료되었습니다.
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
            {...register('loan_amount', { 
              valueAsNumber: true,
              onChange: (e) => {
                // 숫자만 허용하는 정규식으로 검증
                const value = e.target.value;
                if (value && !/^\d*$/.test(value)) {
                  e.target.value = value.replace(/[^\d]/g, '');
                }
              }
            })}
            type="text"
            placeholder="대출 희망금액 * (만원)"
            className={`h-12 text-base ${errors.loan_amount ? 'border-red-500' : ''}`}
            maxLength={5} // 최대 99,999만원 (약 10억원)
          />
          {errors.loan_amount && (
            <p className="text-red-500 text-sm mt-1">{errors.loan_amount.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              상담 신청 중...
            </>
          ) : (
            "무료 상담 신청하기"
          )}
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
