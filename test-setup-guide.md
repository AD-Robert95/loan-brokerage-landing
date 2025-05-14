# Google Sheets & Supabase 연동 테스트 가이드

## 1. 테스트용 Google 스프레드시트 생성

1. [Google Drive](https://drive.google.com/drive/my-drive)에 접속합니다.
2. **새로 만들기 > Google 스프레드시트**를 클릭합니다.
3. 적절한 이름을 지정합니다 (예: "대출문의_테스트").
4. 첫 번째 행에 다음 헤더를 추가합니다:
   | ID | 나이 | 전화번호 | 지역 | 대출금액(원) | 재직여부 | 등록일시 | 데이터유형 |
   |---|---|---|---|---|---|---|---|
5. 스프레드시트 ID 확인:
   - 브라우저 주소 표시줄에서 스프레드시트 ID를 복사합니다.
   - 형식: `https://docs.google.com/spreadsheets/d/{스프레드시트ID}/edit`

6. 서비스 계정에 접근 권한 부여:
   - 스프레드시트 상단의 **공유** 버튼을 클릭합니다.
   - Google 서비스 계정 이메일(GOOGLE_SERVICE_ACCOUNT_EMAIL 값)을 입력합니다.
   - 권한을 **편집자**로 설정합니다.
   - **알림 보내기** 체크박스를 해제합니다.
   - **공유**를 클릭합니다.

## 2. 환경 변수 설정

1. 프로젝트 루트에 `.env.local` 파일을 열거나 생성합니다.
2. 다음 환경 변수를 추가합니다:

```
# 테스트 스프레드시트 ID 추가
GOOGLE_SHEETS_ID_TEST=여기에_복사한_테스트_스프레드시트_ID_붙여넣기
```

3. 변경사항 저장 후 개발 서버를 재시작합니다:
```
npm run dev
```

## 3. 테스트 테이블 생성

1. [Supabase 대시보드](https://supabase.com/)에 로그인합니다.
2. 프로젝트를 선택합니다.
3. **SQL 편집기**로 이동합니다.
4. 다음 SQL 쿼리를 실행합니다:

```sql
-- 테스트 테이블이 있으면 삭제
DROP TABLE IF EXISTS loanbrothers_test;

-- 프로덕션 테이블과 동일한 구조로 테스트 테이블 생성
CREATE TABLE loanbrothers_test AS 
SELECT * FROM loanbrothers
WHERE 1=0;

-- ID 컬럼에 기본 키 추가
ALTER TABLE loanbrothers_test ADD PRIMARY KEY (id);

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

## 4. API 엔드포인트 테스트

### 환경 설정 검증

브라우저 또는 터미널에서 환경 설정 검증 API를 호출합니다:

```bash
# 브라우저
http://localhost:3000/api/check-env

# 또는 터미널
curl http://localhost:3000/api/check-env | json_pp
```

응답에서 다음 항목을 확인하세요:
- `success`: true
- `environment.optional.GOOGLE_SHEETS_ID_TEST`: true
- `connection_test.test_sheets.success`: true

### 전체 통합 테스트

환경 설정이 검증되었다면, 전체 통합 테스트를 실행합니다:

```bash
# 브라우저
http://localhost:3000/api/test-sheets

# 또는 터미널
curl http://localhost:3000/api/test-sheets | json_pp
```

응답에서 다음 항목을 확인하세요:
- `success`: true
- `message`: "테스트가 성공적으로 완료되었습니다"
- `test_record`: 삽입된 테스트 데이터 정보

### 결과 확인

1. **Supabase 테이블 확인**:
   - Supabase 대시보드에서 `loanbrothers_test` 테이블을 확인하여 테스트 데이터가 추가되었는지 확인합니다.

2. **Google 스프레드시트 확인**:
   - 테스트용 Google 스프레드시트를 열어 데이터가 추가되었는지 확인합니다.
   - 마지막 열 "데이터유형"에 "테스트"로 표시된 행이 있어야 합니다.

## 5. 커스텀 테스트 데이터 사용

필요한 경우 커스텀 테스트 데이터로 테스트할 수 있습니다:

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

## 문제 해결

테스트가 실패하는 경우:

1. **환경 변수 문제**:
   - `/api/check-env` 응답의 `recommendations` 항목을 확인하세요.
   - GOOGLE_SHEETS_ID_TEST 환경 변수가 올바르게 설정되었는지 확인하세요.

2. **권한 문제**:
   - 서비스 계정에 테스트 스프레드시트 편집 권한이 부여되었는지 확인하세요.

3. **테이블 문제**:
   - Supabase에서 `loanbrothers_test` 테이블이 올바르게 생성되었는지 확인하세요.

4. **로그 확인**:
   - 개발 서버 콘솔 로그에서 자세한 오류 메시지를 확인하세요. 