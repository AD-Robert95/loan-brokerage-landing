import { NextResponse } from 'next/server';
import { appendLoanDataToSheet, validateGoogleSheetsAccess } from '@/lib/google-sheets';
import { validateAndInsertLead, ensureTestTableExists } from '@/lib/supabase';

// 테스트용 더미 데이터
const testData = {
  age: 35,
  phone_number: '01012345678',
  location: '서울시 강남구',
  loan_amount: 50000000,
  employed: true
};

/**
 * GET - Google Sheets 연동 테스트
 * 
 * 직접 호출 가능한 테스트 엔드포인트:
 * - 실제 데이터 없이 더미 데이터로 테스트
 * - 환경 변수 설정 검증
 * - Google Sheets & Supabase 연결 확인
 */
export async function GET(request: Request) {
  try {
    // 테스트 모드 플래그 사용 (환경변수 직접 수정 대신)
    const isTestMode = true;
    
    // 1. 환경 변수 및 연결 설정 검증
    const sheetsAccessResult = await validateGoogleSheetsAccess();
    
    if (!sheetsAccessResult.success) {
      return NextResponse.json({
        success: false,
        step: 'sheets_validation',
        error: sheetsAccessResult.error
      }, { status: 500 });
    }
    
    // 2. 테스트 테이블 존재 여부 확인/생성
    const tableResult = await ensureTestTableExists();
    
    if (!tableResult.success) {
      return NextResponse.json({
        success: false,
        step: 'table_check',
        error: tableResult.error,
        recommendation: tableResult.recommendation
      }, { status: 500 });
    }
    
    // 3. Supabase에 테스트 데이터 삽입
    const supabaseResult = await validateAndInsertLead(testData, { isTestMode });
    
    if (!supabaseResult.success) {
      return NextResponse.json({
        success: false,
        step: 'supabase_insert',
        error: supabaseResult.error
      }, { status: 500 });
    }
    
    // 4. Google Sheets에 테스트 데이터 추가
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
    
    // 5. 모든 단계 성공
    return NextResponse.json({
      success: true,
      message: '테스트가 성공적으로 완료되었습니다',
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
 * POST - 커스텀 테스트 데이터로 테스트
 * 
 * 사용자 지정 데이터로 테스트:
 * - 요청 바디에 테스트용 데이터 포함
 * - 환경 변수로 테스트 여부 제어
 */
export async function POST(request: Request) {
  try {
    // 테스트 모드 플래그 사용
    const isTestMode = true;
    
    // 사용자 지정 테스트 데이터
    const customData = await request.json();
    
    // Supabase에 테스트 데이터 삽입
    const supabaseResult = await validateAndInsertLead(customData, { isTestMode });
    
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
      message: '커스텀 테스트가 성공적으로 완료되었습니다',
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