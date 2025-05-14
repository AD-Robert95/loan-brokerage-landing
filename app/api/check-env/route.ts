import { NextResponse } from 'next/server';
import { validateGoogleSheetsAccess } from '@/lib/google-sheets';

/**
 * GET - 환경 변수 및 서비스 연결 상태 확인
 * 
 * 이 엔드포인트는 다음을 검증합니다:
 * 1. 필요한 환경 변수의 존재 여부
 * 2. Google Sheets API 연결 상태
 * 3. 현재 실행 환경 정보
 */
export async function GET(request: Request) {
  try {
    // 필수 환경 변수 검증
    const requiredVars = [
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_SHEETS_ID',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    const optionalVars = [
      'GOOGLE_SHEETS_ID_TEST',
      'VERCEL_ENV'
    ];
    
    const environmentStatus = {
      required: {} as Record<string, boolean>,
      optional: {} as Record<string, boolean>,
      runtime: {
        node_env: process.env.NODE_ENV || 'undefined',
        vercel_env: process.env.VERCEL_ENV || 'undefined'
      }
    };
    
    // 필수 변수 체크
    requiredVars.forEach(varName => {
      const exists = !!process.env[varName];
      environmentStatus.required[varName] = exists;
      
      // 비밀 값의 잘림 여부 체크 (예: GOOGLE_PRIVATE_KEY)
      if (varName === 'GOOGLE_PRIVATE_KEY' && exists) {
        const key = process.env[varName] || '';
        const hasValidFormat = key.includes('BEGIN PRIVATE KEY') && key.includes('END PRIVATE KEY');
        environmentStatus.required[`${varName}_valid_format`] = hasValidFormat;
      }
    });
    
    // 선택 변수 체크
    optionalVars.forEach(varName => {
      environmentStatus.optional[varName] = !!process.env[varName];
    });
    
    // Google Sheets API 연결 테스트 - 프로덕션 모드
    const sheetsTestResult = await validateGoogleSheetsAccess();
    
    // Google Sheets API 연결 테스트 - 테스트 모드
    const testSheetsResult = await validateGoogleSheetsAccess({ forceTestMode: true });
    
    // 전체 진단 결과 반환
    return NextResponse.json({
      success: true,
      environment: environmentStatus,
      connection_test: {
        production_sheets: {
          success: sheetsTestResult.success,
          spreadsheet_title: sheetsTestResult.spreadsheetTitle || null,
          error: sheetsTestResult.error || null
        },
        test_sheets: {
          success: testSheetsResult.success,
          spreadsheet_title: testSheetsResult.spreadsheetTitle || null,
          error: testSheetsResult.error || null,
          available: environmentStatus.optional['GOOGLE_SHEETS_ID_TEST']
        }
      },
      recommendations: getRecommendations(environmentStatus, sheetsTestResult, testSheetsResult)
    });
  } catch (error) {
    console.error('환경 체크 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    }, { status: 500 });
  }
}

/**
 * 환경 설정 상태에 따른 권장사항 생성
 */
function getRecommendations(
  env: any, 
  prodSheetsResult: any, 
  testSheetsResult: any
): string[] {
  const recommendations: string[] = [];
  
  // 필수 환경 변수 체크
  if (Object.values(env.required).includes(false)) {
    const missingVars = Object.entries(env.required)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name);
      
    recommendations.push(`다음 필수 환경 변수를 설정해주세요: ${missingVars.join(', ')}`);
  }
  
  // GOOGLE_PRIVATE_KEY 형식 체크
  if (env.required['GOOGLE_PRIVATE_KEY'] && !env.required['GOOGLE_PRIVATE_KEY_valid_format']) {
    recommendations.push('GOOGLE_PRIVATE_KEY 환경 변수가 올바른 형식이 아닙니다. 키는 "-----BEGIN PRIVATE KEY-----"으로 시작하고 "-----END PRIVATE KEY-----"로 끝나야 합니다.');
  }
  
  // 테스트 환경 설정 권장
  if (!env.optional['GOOGLE_SHEETS_ID_TEST']) {
    recommendations.push('테스트 환경을 위해 GOOGLE_SHEETS_ID_TEST 환경 변수를 설정하는 것을 권장합니다.');
  }
  
  // Google Sheets 연결 문제
  if (!prodSheetsResult.success) {
    recommendations.push('Google Sheets API 연결에 실패했습니다. 서비스 계정 키와 스프레드시트 ID를 확인해주세요.');
  }
  
  // 테스트 Google Sheets 연결 문제
  if (env.optional['GOOGLE_SHEETS_ID_TEST'] && !testSheetsResult.success) {
    recommendations.push('테스트용 Google Sheets API 연결에 실패했습니다. GOOGLE_SHEETS_ID_TEST 값을 확인해주세요.');
  }
  
  return recommendations;
} 