import { NextResponse } from 'next/server';
import { validateGoogleSheetsAccess } from '@/lib/google-sheets';

/**
 * GET - Google Sheets 연동 설정 검증
 * 
 * 이 엔드포인트는 Google Sheets API 연결 상태만 검증합니다:
 * - 환경 변수 확인
 * - 서비스 계정 권한 확인
 * - 스프레드시트 접근 테스트
 */
export async function GET(request: Request) {
  try {
    // 1. 환경 변수 확인
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SERVICE_ACCOUNT_EMAIL 환경 변수가 설정되지 않았습니다.'
      }, { status: 500 });
    }
    
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_PRIVATE_KEY 환경 변수가 설정되지 않았습니다.'
      }, { status: 500 });
    }
    
    if (!process.env.GOOGLE_SHEETS_ID) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SHEETS_ID 환경 변수가 설정되지 않았습니다.'
      }, { status: 500 });
    }
    
    // 2. GOOGLE_PRIVATE_KEY 형식 검증
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const hasValidFormat = privateKey.includes('BEGIN PRIVATE KEY') && privateKey.includes('END PRIVATE KEY');
    
    if (!hasValidFormat) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_PRIVATE_KEY 환경 변수가 올바른 형식이 아닙니다.',
        details: '키는 "-----BEGIN PRIVATE KEY-----"으로 시작하고 "-----END PRIVATE KEY-----"로 끝나야 합니다.'
      }, { status: 500 });
    }
    
    // 3. Google Sheets API 연결 검증
    console.log('Google Sheets 설정 검증 시작...');
    const sheetsAccessResult = await validateGoogleSheetsAccess();
    
    if (!sheetsAccessResult.success) {
      console.error('Google Sheets 연결 실패:', sheetsAccessResult.error);
      return NextResponse.json({
        success: false,
        error: '스프레드시트 접근 검증에 실패했습니다.',
        details: sheetsAccessResult.error
      }, { status: 500 });
    }
    
    console.log('Google Sheets 설정 검증 성공');
    
    // 4. 성공 응답
    return NextResponse.json({
      success: true,
      message: 'Google Sheets API 연결이 정상적으로 작동합니다.',
      details: {
        spreadsheet: {
          id: process.env.GOOGLE_SHEETS_ID.substring(0, 5) + '...',
          title: sheetsAccessResult.spreadsheetTitle
        },
        service_account: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      }
    });
  } catch (error) {
    console.error('Google Sheets 설정 검증 오류:', error);
    return NextResponse.json({
      success: false,
      error: '예상치 못한 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
} 