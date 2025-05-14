import { NextResponse } from 'next/server';
import { validateAndInsertLead } from '@/lib/supabase';
import { appendLoanDataToSheet } from '@/lib/google-sheets';
import type { LoanFormData } from '@/types/loan';

export async function POST(request: Request) {
  try {
    const formData: LoanFormData = await request.json();
    
    // Supabase에 데이터 삽입
    const supabaseResult = await validateAndInsertLead(formData);
    
    if (!supabaseResult.success) {
      throw new Error(supabaseResult.error as string);
    }
    
    // Supabase에서 반환한 데이터가 없는 경우 처리
    if (!supabaseResult.data || !supabaseResult.data[0]) {
      // 삽입은 성공했지만 반환된 데이터가 없는 경우 (드문 경우)
      return NextResponse.json({ success: true });
    }
    
    // Google Sheets에 데이터 추가
    const insertedRecord = supabaseResult.data[0];
    await appendLoanDataToSheet(insertedRecord);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('폼 제출 처리 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
      },
      { status: 500 }
    );
  }
} 