import { NextResponse } from 'next/server';
import { appendLoanDataToSheet, validateGoogleSheetsAccess } from '@/lib/google-sheets';
import { validateAndInsertLead } from '@/lib/supabase';

// 테스트용 더미 데이터
const testData = {
  age: 35,
  phone_number: '01012345678',
  location: '서울시 강남구',
  loan_amount: 50000000,
  employed: true
};

/**
 * GET - 프로덕션 환경에서 Google Sheets 연동 테스트
 * 
 * 주의: 이 엔드포인트는 프로덕션 데이터베이스와 스프레드시트에 직접 데이터를 추가합니다.
 * 테스트 완료 후 반드시 데이터를 정리해야 합니다.
 */
export async function GET(request: Request) {
  try {
    // 1. 환경 변수 및 연결 설정 검증
    const sheetsAccessResult = await validateGoogleSheetsAccess();
    
    if (!sheetsAccessResult.success) {
      return NextResponse.json({
        success: false,
        step: 'sheets_validation',
        error: sheetsAccessResult.error
      }, { status: 500 });
    }
    
    console.log('Google Sheets 연결 검증 성공:', {
      spreadsheet: sheetsAccessResult.spreadsheetTitle,
      environment: sheetsAccessResult.environment
    });
    
    // 2. Supabase에 직접 테스트 데이터 삽입
    const supabaseResult = await validateAndInsertLead(testData);
    
    if (!supabaseResult.success) {
      return NextResponse.json({
        success: false,
        step: 'supabase_insert',
        error: supabaseResult.error
      }, { status: 500 });
    }
    
    console.log('Supabase 데이터 삽입 성공:', { 
      id: supabaseResult.data?.[0]?.id 
    });
    
    // 3. Google Sheets에 테스트 데이터 추가
    const insertedRecord = supabaseResult.data?.[0];
    
    if (!insertedRecord) {
      return NextResponse.json({
        success: false,
        step: 'data_retrieval',
        error: 'Supabase에서 삽입된 데이터를 반환받지 못했습니다'
      }, { status: 500 });
    }
    
    const sheetsResult = await appendLoanDataToSheet(insertedRecord);
    
    if (!sheetsResult.success) {
      return NextResponse.json({
        success: false,
        step: 'sheets_append',
        error: sheetsResult.error
      }, { status: 500 });
    }
    
    console.log('Google Sheets 데이터 추가 성공');
    
    // 4. 모든 단계 성공
    return NextResponse.json({
      success: true,
      message: '프로덕션 환경에서 테스트가 성공적으로 완료되었습니다',
      environment: {
        spreadsheet: sheetsAccessResult.spreadsheetTitle,
        mode: sheetsAccessResult.environment
      },
      test_record: {
        id: insertedRecord.id,
        created_at: insertedRecord.created_at
      }
    });
  } catch (error) {
    console.error('테스트 프로세스 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    }, { status: 500 });
  }
}

/**
 * POST - 커스텀 테스트 데이터로 테스트 (프로덕션 환경)
 */
export async function POST(request: Request) {
  try {
    // 사용자 지정 테스트 데이터
    const customData = await request.json();
    
    console.log('프로덕션 커스텀 테스트 시작:', {
      age: customData.age,
      phone: customData.phone_number
    });
    
    // Supabase에 테스트 데이터 삽입
    const supabaseResult = await validateAndInsertLead(customData);
    
    if (!supabaseResult.success) {
      return NextResponse.json({
        success: false,
        step: 'supabase_insert',
        error: supabaseResult.error
      }, { status: 500 });
    }
    
    // Google Sheets에 테스트 데이터 추가
    const insertedRecord = supabaseResult.data?.[0];
    
    if (!insertedRecord) {
      return NextResponse.json({
        success: false,
        step: 'data_retrieval',
        error: 'Supabase에서 삽입된 데이터를 반환받지 못했습니다'
      }, { status: 500 });
    }
    
    const sheetsResult = await appendLoanDataToSheet(insertedRecord);
    
    if (!sheetsResult.success) {
      return NextResponse.json({
        success: false,
        step: 'sheets_append',
        error: sheetsResult.error
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: '프로덕션 환경에서 커스텀 테스트가 성공적으로 완료되었습니다',
      test_record: {
        id: insertedRecord.id,
        created_at: insertedRecord.created_at
      }
    });
  } catch (error) {
    console.error('커스텀 테스트 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    }, { status: 500 });
  }
} 