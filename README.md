# 대출 중개 랜딩 페이지

Next.js와 Supabase를 활용한 대출 중개 랜딩 페이지 프로젝트입니다.

## 기술 스택

- Next.js
- TypeScript
- Tailwind CSS
- Supabase (데이터베이스)
- ShadCN UI (컴포넌트)
- SOLAPI (SMS 인증)

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# SOLAPI SMS 인증 설정
SOLAPI_API_KEY=your_solapi_api_key
SOLAPI_API_SECRET=your_solapi_api_secret
SOLAPI_SENDER=your_registered_phone_number
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

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

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