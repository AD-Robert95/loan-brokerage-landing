# Supabase와 Google Sheets 연동 가이드

## 개요

이 문서는 대출 중개 랜딩 페이지에서 대출 문의 양식이 제출되었을 때 다음과 같은 프로세스를 구현하기 위한 가이드입니다:

1. Supabase 데이터베이스에 데이터 저장
2. 저장된 데이터를 Google Sheets에 자동으로 공유

이 문서는 개발팀과 공유하기 위한 참조 자료로, 모든 팀원이 시스템 구조를 이해하고 문제 해결에 참여할 수 있도록 작성되었습니다.

## 현재 시스템 구조

현재 시스템은 다음과 같이 구성되어 있습니다:

- `app/page.tsx`: 메인 랜딩 페이지 (대출 문의 양식 포함)
- `lib/supabase.ts`: Supabase 클라이언트와 데이터 검증 및 삽입 로직
- `types/supabase.ts` & `types/loan.ts`: 데이터 타입 정의

## 데이터 매핑

Supabase의 `loanbrothers` 테이블과 Google Sheets의 열 매핑은 다음과 같습니다:

| Google Sheets 열 | 데이터 필드 | 설명 |
|-----------------|------------|------|
| A | id | 고유 식별자 |
| B | age | 나이 |
| C | phone_number | 전화번호 |
| D | location | 지역 |
| E | loan_amount | 대출금액 |
| F | employed | 재직여부 (O/X) |
| G | created_at | 등록일시 (한국 시간) |

## 구현 단계

### 1. Google Sheets API 설정

#### 1.1. Google Cloud 프로젝트 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Google Sheets API 활성화:
   - APIs & Services > Library로 이동
   - "Google Sheets API" 검색 및 활성화

#### 1.2. 서비스 계정 및 키 생성

1. IAM & Admin > Service Accounts로 이동
2. 새 서비스 계정 생성 (예: loan-form-integration)
3. 적절한 권한 부여 (Sheets API에 접근할 수 있는 권한)
4. 서비스 계정 키(JSON) 생성 및 다운로드
5. 다운로드한 키를 안전하게 보관

### 2. 환경 변수 설정

다음 환경 변수를 개발 및 프로덕션 환경에 설정해야 합니다:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=서비스계정이메일@프로젝트.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_SHEETS_ID=구글스프레드시트ID
```

**중요**: Vercel에 환경 변수 설정 시 GOOGLE_PRIVATE_KEY의 줄바꿈 문자(`\n`)를 그대로 입력해야 합니다. 이는 코드에서 실제 줄바꿈으로 변환됩니다.

### 3. 필요한 패키지 설치

다음 명령어로 필요한 패키지를 설치합니다:

```bash
npm install googleapis
```

### 4. Google Sheets 통합 라이브러리 구현

새 파일 `lib/google-sheets.ts`를 생성하여 Google Sheets와의 연동 기능을 구현합니다:

```typescript
import { google } from 'googleapis';
import type { LoanFormData } from '@/types/loan';

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
export const appendLoanDataToSheet = async (data: LoanFormData & { id: string | number, created_at: string }) => {
  try {
    // 환경 변수 확인
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_ID 환경 변수가 설정되지 않았습니다.');
    }

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
      formattedDate
    ];

    // Google Sheets에 데이터 추가
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:G', // 첫 번째 시트의 A~G 열에 데이터 추가
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });

    console.log('데이터가 Google Sheets에 성공적으로 추가되었습니다.', { id: data.id });
    return { success: true };
  } catch (error) {
    console.error('Google Sheets 데이터 추가 오류:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    };
  }
};
```

### 5. API 엔드포인트 구현

새 파일 `app/api/loan-submission/route.ts`를 생성:

```typescript
import { NextResponse } from 'next/server';
import { validateAndInsertLead } from '@/lib/supabase';
import { appendLoanDataToSheet } from '@/lib/google-sheets';
import type { LoanFormData } from '@/types/loan';

export async function POST(request: Request) {
  try {
    const formData: LoanFormData = await request.json();
    
    console.log('폼 제출 데이터 수신:', { 
      phone: formData.phone_number, 
      age: formData.age, 
      location: formData.location 
    });
    
    // Supabase에 데이터 삽입
    const supabaseResult = await validateAndInsertLead(formData);
    
    if (!supabaseResult.success) {
      throw new Error(supabaseResult.error as string);
    }
    
    console.log('Supabase 데이터 삽입 성공:', { 
      success: supabaseResult.success,
      id: supabaseResult.data?.[0]?.id 
    });
    
    // Supabase에서 반환한 데이터가 없는 경우 처리
    if (!supabaseResult.data || !supabaseResult.data[0]) {
      console.warn('Supabase 삽입 성공했으나 반환된 데이터가 없음');
      return NextResponse.json({ success: true });
    }
    
    // Google Sheets에 데이터 추가
    const insertedRecord = supabaseResult.data[0];
    const sheetsResult = await appendLoanDataToSheet(insertedRecord);
    
    console.log('Google Sheets 데이터 추가 결과:', { success: sheetsResult.success });
    
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
```

### 6. Webhook 엔드포인트 구현 (선택사항)

데이터가 Supabase에 추가될 때 Google Sheets에 자동으로 동기화하는 webhook을 구현할 수 있습니다.

새 파일 `app/api/webhook/supabase/route.ts`를 생성:

```typescript
import { NextResponse } from 'next/server';
import { appendLoanDataToSheet } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    console.log('Supabase webhook 요청 수신:', { 
      table: payload.table, 
      type: payload.type,
      record_id: payload.record?.id 
    });
    
    // 보안 확인 (필요시)
    // const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
    // const signature = request.headers.get('x-supabase-signature');
    // if (webhookSecret && signature !== webhookSecret) {
    //   console.error('유효하지 않은 webhook 서명');
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    // 이벤트 타입 확인
    if (payload.type !== 'INSERT') {
      console.log('INSERT 이벤트가 아니므로 처리 생략');
      return NextResponse.json({ success: true });
    }
    
    // Google Sheets에 데이터 추가
    const record = payload.record;
    const result = await appendLoanDataToSheet(record);
    
    console.log('Webhook Google Sheets 데이터 추가 결과:', { success: result.success });
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error(result.error as string);
    }
  } catch (error) {
    console.error('Webhook 처리 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
```

## Google Sheets 구성 가이드

1. 새 Google Spreadsheet 생성
2. 다음과 같은 헤더로 첫 번째 행 구성:
   - ID
   - 나이
   - 전화번호
   - 지역
   - 대출금액(원)
   - 재직여부
   - 등록일시
3. 서비스 계정 이메일을 스프레드시트 편집자로 공유:
   - 스프레드시트 우측 상단의 "공유" 버튼 클릭
   - 서비스 계정 이메일(GOOGLE_SERVICE_ACCOUNT_EMAIL) 입력
   - "편집자" 권한 부여
   - "알림 보내기" 체크 해제
4. 스프레드시트 ID 복사:
   - 스프레드시트 URL에서 추출: `https://docs.google.com/spreadsheets/d/{스프레드시트ID}/edit`
   - 환경 변수 GOOGLE_SHEETS_ID에 설정

## 문제 해결 가이드

### 구글 서비스 계정 키 문제

1. 키 형식 확인:
   - 키는 `-----BEGIN PRIVATE KEY-----`로 시작하고 `-----END PRIVATE KEY-----`로 끝나야 함
   - 환경 변수에서 줄바꿈이 `\n`으로 표현되어야 함

2. 권한 확인:
   - 서비스 계정이 스프레드시트에 접근 권한이 있는지 확인
   - Google Cloud Console에서 API 할당량 확인

### 데이터 동기화 문제

1. 로깅 확인:
   - Vercel/Netlify 로그에서 오류 메시지 확인
   - `console.log` 출력 확인

2. 데이터 확인:
   - Supabase 테이블에 데이터가 올바르게 삽입되었는지 확인
   - 데이터 포맷이 예상과 일치하는지 확인

3. 단계별 테스트:
   - 각 함수를 개별적으로 테스트하여 문제 지점 파악
   - 테스트 엔드포인트(`/api/test/sheets`)를 만들어 Google Sheets API만 격리하여 테스트

## 테스트 환경 구축 가이드

프로덕션 데이터를 보호하면서 Google Sheets 및 Supabase 연동 로직을 안전하게 테스트하는 방법을 설명합니다.

### 테스트 환경 설정

#### 1. 테스트용 별도 리소스 설정

실제 데이터와 테스트 데이터를 분리하기 위해 다음과 같이 별도의 리소스를 설정합니다:

| 항목 | 실서비스 | 테스트 환경 |
|-----|---------|-----------|
| Google Sheets | 실제 스프레드시트 | 테스트용 별도 스프레드시트 |
| Supabase Table | loanbrothers | loanbrothers_test |

#### 2. 환경 변수 설정

테스트 환경에서는 다음과 같은 환경 변수를 추가로 설정합니다:

```
# 프로덕션 환경
GOOGLE_SHEETS_ID=production-spreadsheet-id

# 테스트 환경
GOOGLE_SHEETS_ID_TEST=test-spreadsheet-id
```

#### 3. 테스트 테이블 생성

Supabase에서 다음 SQL을 실행하여 테스트 테이블을 생성합니다:

```sql
-- 테스트 테이블이 있으면 삭제
DROP TABLE IF EXISTS loanbrothers_test;

-- 프로덕션 테이블과 동일한 구조로 테스트 테이블 생성
CREATE TABLE loanbrothers_test AS 
SELECT * FROM loanbrothers
WHERE 1=0;

-- 프로덕션 테이블의 제약조건 복사
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
  FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
  WHERE tc.table_name = 'loanbrothers'
  LOOP
    -- 프로덕션 테이블의 제약조건을 테스트 테이블에 적용
    -- (간단화를 위해 ID 컬럼의 기본 키와 시퀀스만 처리)
    IF r.constraint_type = 'PRIMARY KEY' THEN
      EXECUTE 'ALTER TABLE loanbrothers_test ADD PRIMARY KEY (' || r.column_name || ')';
    END IF;
  END LOOP;
END$$;

-- RPC 함수 생성 (테스트 테이블을 쉽게 재생성할 수 있도록)
CREATE OR REPLACE FUNCTION create_test_table(source_table text, target_table text)
RETURNS void AS $$
BEGIN
  EXECUTE 'DROP TABLE IF EXISTS ' || target_table;
  EXECUTE 'CREATE TABLE ' || target_table || ' AS SELECT * FROM ' || source_table || ' WHERE 1=0';
  EXECUTE 'ALTER TABLE ' || target_table || ' ADD PRIMARY KEY (id)';
END;
$$ LANGUAGE plpgsql;
```

### 테스트 엔드포인트

프로젝트에는 연동 로직을 안전하게 테스트할 수 있는 다음과 같은 테스트 API 엔드포인트가 포함되어 있습니다:

#### 1. 환경 설정 검증: `/api/check-env`

GET 요청을 통해 다음을 검증합니다:
- 필요한 환경 변수가 올바르게 설정되었는지 확인
- Google Sheets API 연결 테스트
- 테스트 환경 설정 검증

```bash
curl http://localhost:3000/api/check-env
```

#### 2. 전체 통합 테스트: `/api/test-sheets`

GET 요청으로 전체 통합 테스트를 실행합니다:
- 테스트 테이블 존재 여부 확인 및 생성
- 더미 데이터를 사용하여 Supabase 삽입 테스트
- Google Sheets 데이터 추가 테스트

```bash
curl http://localhost:3000/api/test-sheets
```

#### 3. 커스텀 테스트 데이터: `/api/test-sheets` (POST)

사용자 지정 데이터로 테스트하려면 POST 요청을 사용합니다:

```bash
curl -X POST http://localhost:3000/api/test-sheets \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "phone_number": "01012345678",
    "location": "서울시 강남구",
    "loan_amount": 50000000,
    "employed": true
  }'
```

### 환경 기반 테스트

코드에서는 환경에 따라 자동으로 적절한 리소스를 선택합니다:

1. **NODE_ENV 기반 분기 처리**:
   - `process.env.NODE_ENV === 'test'`: 테스트 환경으로 간주
   - 테스트 스프레드시트와 테스트 테이블을 사용

2. **Vercel 환경 기반 분기 처리**:
   - `process.env.VERCEL_ENV === 'preview'`: Vercel PR 미리보기 환경으로 간주
   - 자동으로 테스트 환경 리소스를 사용

### 주의사항

1. **보안**:
   - 테스트용 서비스 계정 키도 실제 키와 동일한 보안 수준으로 관리해야 합니다.
   - 테스트 스프레드시트에도 민감한 데이터를 저장하지 마세요.

2. **테스트 데이터 관리**:
   - 테스트 테이블과 스프레드시트는 주기적으로 초기화하는 것이 좋습니다.
   - 프로덕션 환경과 혼동하지 않도록 테스트 데이터는 명확하게 표시합니다.

3. **접근 제어**:
   - 테스트 엔드포인트는 개발 및 스테이징 환경에서만 접근 가능하도록 제한하세요.
   - 프로덕션 환경에서는 테스트 엔드포인트가 비활성화되어야 합니다.

## 테스트 체크리스트

- [ ] 환경 변수가 올바르게 설정되었는지 확인
- [ ] 폼 제출 테스트 수행
- [ ] Supabase 데이터베이스에 데이터가 올바르게 저장되는지 확인
- [ ] Google Sheets에 데이터가 올바르게 추가되는지 확인
- [ ] 오류 발생 시 적절한 오류 메시지가 표시되는지 확인

## 협업 및 유지보수 가이드

### 코드 변경 시 주의사항

1. 데이터 구조 변경:
   - Supabase 테이블 스키마를 변경할 경우, Google Sheets 매핑도 함께 업데이트
   - 타입 정의(`types/loan.ts`)를 항상 최신 상태로 유지

2. API 엔드포인트:
   - 기존 요청 형식을 변경하는 경우, 페이지의 폼 제출 로직도 업데이트
   - 모든 API 변경사항은 팀 내 공유 및 문서화

### 모니터링 및 알림

1. 오류 모니터링:
   - Vercel/Netlify 로그 정기적으로 확인
   - 필요시 Sentry 등의 오류 추적 서비스 도입 고려

2. 알림 설정:
   - 중요 오류 발생 시 알림 받을 수 있도록 설정

## 추가 고려사항

### 보안

1. 환경 변수:
   - 서비스 계정 키는 항상 환경 변수로 관리
   - 개발 환경에서도 `.env.local` 등을 통해 안전하게 관리

2. API 보안:
   - 폼 제출 API에 CSRF 보호 고려
   - Webhook 엔드포인트는 서명 검증 구현

### 성능

1. 비동기 처리:
   - Google Sheets 업데이트는 사용자 응답에 영향을 주지 않도록 설계
   - 대규모 데이터 처리 시 배치 처리 고려

### 확장성

1. 추가 통합:
   - 향후 CRM 또는 다른 서비스와의 통합 확장 시 구조 고려
   - 필요시 이벤트 기반 아키텍처로 전환 검토

## 참고 자료

- [Google Sheets API 문서](https://developers.google.com/sheets/api/guides/concepts)
- [Supabase 문서](https://supabase.io/docs)
- [Next.js API Routes 문서](https://nextjs.org/docs/api-routes/introduction)

---

이 문서는 개발팀이 Google Sheets 연동 기능을 이해하고 유지보수할 수 있도록 작성되었습니다. 변경사항이 있을 경우 이 문서도 함께 업데이트해주세요. 