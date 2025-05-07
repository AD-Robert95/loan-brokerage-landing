"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { LoanConsultationFormData } from '@/types/loan';

const formSchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  phone: z.string().regex(/^[0-9]{3}[0-9]{4}[0-9]{4}$/, '올바른 전화번호를 입력해주세요'),
  region: z.string().min(1, '지역을 입력해주세요'),
  employment_status: z.enum(['employed', 'unemployed']),
  loan_amount: z.number().min(0, '대출 금액을 입력해주세요'),
});

interface LoanConsultationFormProps {
  onSubmit: (data: { name: string; phone: string; amount: number }) => Promise<{ success: boolean; error?: unknown }>
}

export function LoanConsultationForm({ onSubmit }: LoanConsultationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LoanConsultationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employment_status: 'employed',
      loan_amount: 0,
    }
  });

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      amount: Number(formData.get('amount'))
    }
    
    const result = await onSubmit(data)
    if (result.success) {
      toast.success('상담 신청이 완료되었습니다.')
      reset()
    } else {
      toast.error('상담 신청 중 오류가 발생했습니다.')
    }
  }

  return (
    <form onSubmit={handleSubmitForm} className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
  const onSubmit = async (data: LoanConsultationFormData) => {
    setIsSubmitting(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const { error } = await supabase
        .from('loan_consultations')
        .insert([{
          ...data,
          loan_amount: Number(data.loan_amount),
          status: 'pending'
        }]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('상담 신청이 완료되었습니다.');
      reset();
    } catch (error) {
      console.error('Error:', error);
      toast.error('상담 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">실시간 대출 상담</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            {...register('name')}
            type="text"
            placeholder="이름 *"
            className={`h-12 text-base ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Input
            {...register('phone')}
            type="tel"
            placeholder="전화번호 * (숫자만 입력)"
            className={`h-12 text-base ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Input
            {...register('region')}
            type="text"
            placeholder="지역 *"
            className={`h-12 text-base ${errors.region ? 'border-red-500' : ''}`}
          />
          {errors.region && (
            <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>
          )}
        </div>

        <div>
          <select
            {...register('employment_status')}
            className={`w-full h-12 px-3 py-2 text-base bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.employment_status ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="employed">재직중 (O)</option>
            <option value="unemployed">미취업 (X)</option>
          </select>
          {errors.employment_status && (
            <p className="text-red-500 text-sm mt-1">{errors.employment_status.message}</p>
          )}
        </div>

        <div>
          <Input
            {...register('loan_amount', { valueAsNumber: true })}
            type="number"
            placeholder="대출 희망금액 * (만원)"
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
      </form>
    </div>
  );
}
