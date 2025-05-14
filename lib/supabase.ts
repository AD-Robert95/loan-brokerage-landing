import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { LoanFormData } from '@/types/loan';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Supabase 클라이언트 인스턴스 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// 환경에 따른 테이블 이름 선택
const getTableName = () => {
  const isTest = process.env.NODE_ENV === 'test';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isTestMode = isTest || isPreview;
  
  return isTestMode ? 'loanbrothers_test' : 'loanbrothers';
};

// 입력 데이터 유효성 검증
const validateLoanData = (data: LoanFormData) => {
  // 나이 검증
  if (data.age < 18) {
    return {
      success: false,
      error: '나이는 18세 이상이어야 합니다'
    };
  }
  
  // 전화번호 검증
  if (!data.phone_number.match(/^[0-9]{10,11}$/)) {
    return {
      success: false,
      error: '올바른 전화번호 형식이 아닙니다'
    };
  }
  
  // 대출 금액 검증
  if (data.loan_amount < 1000000) {
    return {
      success: false,
      error: '대출 금액은 100만원 이상이어야 합니다'
    };
  }
  
  return { success: true };
};

// 대출 문의 데이터 검증 및 Supabase에 삽입
export const validateAndInsertLead = async (formData: LoanFormData) => {
  try {
    // 유효성 검증
    const validationResult = validateLoanData(formData);
    if (!validationResult.success) {
      return validationResult;
    }

    const tableName = getTableName();
    const isTestMode = tableName === 'loanbrothers_test';
    
    console.log(`[${isTestMode ? '테스트' : '프로덕션'}] Supabase 데이터 삽입 시작:`, {
      table: tableName,
      phone: formData.phone_number
    });

    // Supabase에 데이터 삽입
    const { data, error } = await supabase
      .from(tableName)
      .insert([formData])
      .select(); // 삽입 후 데이터 반환 (ID 등 생성된 필드 포함)

    if (error) {
      console.error(`[${isTestMode ? '테스트' : '프로덕션'}] Supabase 데이터 삽입 오류:`, error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log(`[${isTestMode ? '테스트' : '프로덕션'}] Supabase 데이터 삽입 성공:`, {
      id: data?.[0]?.id,
      table: tableName
    });

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Supabase 데이터 처리 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    };
  }
};

// 테스트 테이블 존재 여부 확인 (없으면 생성)
export const ensureTestTableExists = async () => {
  try {
    const productionTable = 'loanbrothers';
    const testTable = 'loanbrothers_test';
    
    // 테스트 테이블 존재 여부 확인
    const { data: tableInfo, error: tableError } = await supabase
      .from('_postgrest_meta')
      .select('schema')
      .single();
    
    if (tableError) {
      // 메타데이터 접근 권한이 없는 경우, 직접 테이블에 접근해보기
      const { error: testError } = await supabase
        .from(testTable)
        .select('id')
        .limit(1);
        
      // 테이블이 이미 존재하면 성공 반환
      if (!testError) {
        return { success: true, exists: true };
      }
      
      // 테이블이 없으면 SQL 쿼리로 생성
      const { error: createError } = await supabase.rpc('create_test_table', {
        source_table: productionTable,
        target_table: testTable
      });
      
      if (createError) {
        console.error('테스트 테이블 생성 오류:', createError);
        return { 
          success: false, 
          error: createError.message,
          recommendation: '관리자 권한으로 Supabase SQL 에디터에서 테스트 테이블을 생성해 주세요.' 
        };
      }
      
      return { success: true, created: true };
    }
    
    return { success: true, exists: true };
  } catch (error) {
    console.error('테스트 테이블 체크 오류:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    };
  }
}; 