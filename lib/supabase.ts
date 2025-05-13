import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { LoanFormData } from '@/types/loan';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// 타입이 적용된 Supabase 클라이언트 생성
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
); 

// 데이터 유효성 검증 및 타입 변환을 위한 유틸리티 함수
export const validateAndInsertLead = async (payload: LoanFormData) => {
  try {
    // 데이터 유효성 검증
    if (payload.age < 18) {
      throw new Error('나이는 18세 이상이어야 합니다');
    }
    
    if (!payload.phone_number.match(/^[0-9]{10,11}$/)) {
      throw new Error('올바른 전화번호 형식이 아닙니다');
    }
    
    if (payload.loan_amount < 1000000) {
      throw new Error('대출 금액은 100만원 이상이어야 합니다');
    }
    
    // 타입 변환 보장
    const formattedPayload = {
      ...payload,
      employed: Boolean(payload.employed),
      age: Number(payload.age),
      loan_amount: Number(payload.loan_amount)
    };
    
    // 데이터 삽입
    const { data, error } = await supabase
      .from('loanbrothers')
      .insert(formattedPayload);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('데이터 삽입 오류:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    };
  }
}; 