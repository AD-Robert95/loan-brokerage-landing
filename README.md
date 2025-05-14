# 대출 중개 랜딩 페이지

## 소개

대출 중개 서비스를 위한 랜딩 페이지입니다. 사용자가 대출 문의 양식을 제출하면 해당 데이터가 Supabase 데이터베이스에 저장되고 Google Sheets에 자동으로 공유됩니다.

## 기능

- 반응형 랜딩 페이지
- 대출 문의 양식
- 휴대폰 번호 인증 (SMS)
- Supabase 데이터베이스 연동
- Google Sheets 자동 연동

## 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 환경 변수

`.env.local` 파일을 루트 디렉토리에 생성하고 다음 변수들을 설정해야 합니다:

```
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# SMS 인증 API 설정 (SOLAPI)
SOLAPI_API_KEY=your-solapi-api-key
SOLAPI_API_SECRET=your-solapi-api-secret

# Google Sheets API 설정
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n
GOOGLE_SHEETS_ID=your-google-spreadsheet-id
GOOGLE_SHEET_NAME=Sheet1  # (선택 사항) 데이터를 저장할 시트 이름, 기본값은 Sheet1
```

## Google Sheets 연동 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트 생성
2. Google Sheets API 활성화
3. 서비스 계정 생성 및 키 다운로드
4. Google Spreadsheet 생성 및 서비스 계정과 공유
5. `.env.local` 파일에 필요한 환경 변수 설정

## 데이터 매핑

Supabase의 `loanbrothers` 테이블과 Google Sheets의 컬럼 매핑은 다음과 같습니다:

| Supabase 컬럼 | Google Sheets 열 | 설명 |
|-------------|----------------|------|
| id          | A열            | 고유 ID |
| age         | B열            | 나이 |
| phone_number | C열            | 전화번호 |
| location    | D열            | 지역 |
| loan_amount | E열            | 대출 희망 금액 |
| employed    | F열            | 재직 여부 (O/X) |
| created_at  | G열            | 등록 일시 |

## 기술 스택

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- ShadCN UI
- Supabase
- Google Sheets API
- SOLAPI (문자 인증)

## 프로젝트 구조

```
/
├── app/                  # Next.js 앱 디렉토리
│   ├── api/              # API 엔드포인트
│   │   ├── loan-submission/  # 대출 문의 제출 API
│   │   ├── sms/          # 문자 인증 API
│   │   └── webhook/      # Supabase Webhook
│   ├── layout.tsx        # 레이아웃 컴포넌트
│   └── page.tsx          # 메인 페이지
├── components/           # React 컴포넌트
│   ├── ui/              # ShadCN UI 컴포넌트
│   └── ...
├── lib/                  # 유틸리티 및 서비스
│   ├── google-sheets.ts  # Google Sheets 연동 라이브러리
│   ├── notion.ts         # SMS 인증 로직
│   └── supabase.ts       # Supabase 클라이언트 및 로직
├── styles/               # 전역 스타일
│   └── globals.css       # 전역 CSS
├── types/                # TypeScript 타입 정의
├── .env.local           # 환경 변수 (git에 포함되지 않음)
└── ...
```

## Supabase 테이블 구조

`loanbrothers` 테이블은 다음과 같은 구조를 가집니다:

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | uuid | 기본 키 (자동 생성) |
| age | int | 고객 나이 |
| phone_number | text | 전화번호 |
| location | text | 지역 |
| loan_amount | int | 대출 희망 금액 |
| employed | boolean | 재직 여부 |
| created_at | timestamp | 생성 시간 (기본값: now()) |

## SMS 인증 시스템

본 프로젝트는 SOLAPI를 사용하여 전화번호 인증 시스템을 구현했습니다.

### 인증 과정
1. 사용자가 전화번호 입력 후 인증번호 요청
2. 시스템이 6자리 난수 생성하여 사용자 휴대폰으로 전송
3. 사용자가 인증번호 입력 후 검증
4. 인증 성공 시 폼 제출 가능

### SOLAPI 연동 주의사항
- API 키와 시크릿은 절대 클라이언트 측에 노출되지 않도록 주의
- SMS 인증 요청 시 서명(Signature) 생성 형식 준수
  - 날짜 형식: `YYYY-MM-DD HH:mm:ss`
  - 서명 생성: `HMAC-SHA256(date + salt, API Secret)`을 hex로 인코딩
  - 인증 헤더 형식: `HMAC-SHA256 apiKey=값, date=값, salt=값, signature=값`

## 주요 기능

- 대출 상담 신청 폼
- 실시간 Supabase 데이터 저장
- 모바일 반응형 디자인
- 대출 정보 섹션
- SMS 전화번호 인증

## 데이터 흐름

1. 사용자가 전화번호 인증 완료
2. 폼 제출 시 Supabase에 데이터 저장
3. Make.com과 같은 서비스를 통해 데이터 활용 가능 