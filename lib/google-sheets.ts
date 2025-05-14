import { google } from 'googleapis';
import type { LoanFormData } from '@/types/loan';

/**
 * Supabase와 Google Sheets 컬럼 매핑
 * 
 * Supabase 'loanbrothers' 테이블:
 * - id: string | number (UUID 또는 숫자 ID)
 * - age: number (고객 나이)
 * - phone_number: string (전화번호)
 * - location: string (지역)
 * - loan_amount: number (대출 희망 금액)
 * - employed: boolean (재직 여부)
 * - created_at: string (생성 시간)
 * 
 * Google Sheets 컬럼:
 * - A열: ID
 * - B열: 나이
 * - C열: 전화번호
 * - D열: 지역
 * - E열: 대출금액(원)
 * - F열: 재직여부(O/X)
 * - G열: 등록일시
 */

// 환경 설정 헬퍼 함수
const getEnvironmentConfig = (options?: { forceTestMode?: boolean }) => {
  const isTest = options?.forceTestMode || process.env.NODE_ENV === 'test';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isTestMode = isTest || isPreview;
  
  const spreadsheetId = isTestMode
    ? process.env.GOOGLE_SHEETS_ID_TEST
    : process.env.GOOGLE_SHEETS_ID;
  
  return {
    isTestMode,
    spreadsheetId,
    sheetName: isTestMode ? 'Sheet1' : '시트1', // 한국어 시트명으로 변경
  };
};

// Google Sheets API 클라이언트 설정
const getGoogleSheetsClient = () => {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  };

  const auth = new google.auth.JWT(
    credentials.client_email,
    undefined,
    credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  return google.sheets({ version: 'v4', auth });
};

// 대출 문의 데이터를 Google Sheets에 추가
export const appendLoanDataToSheet = async (
  data: LoanFormData & { id: string | number, created_at: string },
  options?: { forceTestMode?: boolean }
) => {
  try {
    const { isTestMode, spreadsheetId, sheetName } = getEnvironmentConfig(options);
    
    // 환경 변수 확인
    if (!spreadsheetId) {
      throw new Error(`${isTestMode ? 'GOOGLE_SHEETS_ID_TEST' : 'GOOGLE_SHEETS_ID'} 환경 변수가 설정되지 않았습니다.`);
    }

    console.log(`[${isTestMode ? '테스트' : '프로덕션'}] Google Sheets 처리 시작:`, { 
      spreadsheetId: `${spreadsheetId.substring(0, 5)}...`, 
      id: data.id
    });

    const sheets = getGoogleSheetsClient();
    
    // 현재 한국 시간 포맷
    const formattedDate = new Date(data.created_at).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul'
    });

    // Sheets에 추가할 데이터 행 준비
    const rowData = [
      data.id.toString(),
      data.age.toString(),
      data.phone_number,
      data.location,
      data.loan_amount.toString(),
      data.employed ? 'O' : 'X',
      formattedDate,
      isTestMode ? '테스트' : '실제'  // 테스트 여부 표시 (구분을 위해)
    ];

    // Google Sheets에 데이터 추가
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:H`, // 8번째 열까지 사용 (테스트 표시 추가)
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });

    console.log(`[${isTestMode ? '테스트' : '프로덕션'}] Google Sheets 데이터 추가 성공:`, { 
      id: data.id,
      updatedRange: response.data.updates?.updatedRange
    });
    
    return { success: true };
  } catch (error) {
    console.error('Google Sheets 데이터 추가 오류:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    };
  }
};

// 서비스 계정 키와 권한 검증 함수
export const validateGoogleSheetsAccess = async (options?: { forceTestMode?: boolean }) => {
  try {
    const { spreadsheetId, isTestMode } = getEnvironmentConfig(options);
    
    if (!spreadsheetId) {
      throw new Error(`${isTestMode ? 'GOOGLE_SHEETS_ID_TEST' : 'GOOGLE_SHEETS_ID'} 환경 변수가 설정되지 않았습니다.`);
    }
    
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL 환경 변수가 설정되지 않았습니다.');
    }
    
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('GOOGLE_PRIVATE_KEY 환경 변수가 설정되지 않았습니다.');
    }
    
    const sheets = getGoogleSheetsClient();
    
    // 스프레드시트 메타데이터 읽어오기 시도
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'properties.title'
    });
    
    return {
      success: true,
      spreadsheetTitle: response.data.properties?.title,
      environment: isTestMode ? '테스트' : '프로덕션',
      spreadsheetId: `${spreadsheetId.substring(0, 5)}...` // 보안상 전체 ID 노출 방지
    };
  } catch (error) {
    console.error('Google Sheets 접근 검증 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      errorDetails: error
    };
  }
}; 