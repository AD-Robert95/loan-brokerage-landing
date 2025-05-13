# 대출 중개 랜딩 페이지

Next.js와 Supabase를 활용한 대출 중개 랜딩 페이지 프로젝트입니다.

## 기술 스택

- Next.js
- TypeScript
- Tailwind CSS
- Supabase (데이터베이스)
- ShadCN UI (컴포넌트)

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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

## 데이터 흐름

1. 사용자가 폼 제출
2. Supabase에 데이터 저장
3. Make.com과 같은 서비스를 통해 데이터 활용 가능 