# 어드민 대시보드 Phase 2 개선사항 PRD

## 1. 프로젝트 개요

### 1.1 프로젝트 명
**대출브라더스 어드민 대시보드 Phase 2 - 실무 효율성 개선**

### 1.2 목적
1~2인 소규모 관리자가 일상 업무에서 실제로 필요한 핵심 기능들을 추가하여 업무 효율성을 극대화

### 1.3 배경
- Phase 1 완료 후 실제 사용 중 추가 니즈 발생
- 날짜별 신청 현황 파악 필요성
- 고객 데이터 외부 활용을 위한 엑셀 다운로드 필요
- 불필요한 ID 정보로 인한 화면 복잡성

## 2. 목표 및 성공 지표

### 2.1 핵심 목표
- **날짜 필터링**: 특정 기간 신청 현황 빠른 조회
- **데이터 내보내기**: 엑셀 다운로드로 외부 활용 지원
- **UI 간소화**: 불필요한 정보 제거로 가독성 향상

### 2.2 성공 지표 (KPI)
- [ ] 날짜 필터 사용률 80% 이상
- [ ] 엑셀 다운로드 성공률 100%
- [ ] 화면 정보 밀도 20% 개선 (ID 컬럼 제거)
- [ ] 관리자 업무 시간 30% 단축

## 3. 기능 요구사항

### 3.1 Feature 1: 날짜별 필터링 (Date Range Filter)

#### 3.1.1 기능 설명
**현재**: 최근 50건 고정 표시
**개선**: 날짜 범위 선택으로 원하는 기간 데이터 조회

#### 3.1.2 필터 옵션 (1~2인 관리자 최적화)
```typescript
// 간단한 프리셋 + 사용자 정의
type DateFilterPreset = 
  | 'today'        // 오늘
  | 'yesterday'    // 어제  
  | 'thisWeek'     // 이번 주
  | 'lastWeek'     // 지난 주
  | 'thisMonth'    // 이번 달
  | 'lastMonth'    // 지난 달
  | 'custom'       // 사용자 정의
```

#### 3.1.3 UI 설계
- **위치**: 테이블 상단, 제목 옆
- **형태**: 드롭다운 + 날짜 선택기 (사용자 정의 시)
- **기본값**: '이번 주' (가장 자주 사용)

#### 3.1.4 구현 요구사항
- ✅ ShadCN Select + HTML5 Date Input 조합
- ✅ 실시간 필터링 (API 호출)
- ✅ URL 상태 유지 (새로고침 시 필터 유지)
- ✅ 로딩 상태 표시
- ✅ 브라우저 네이티브 날짜 선택기 활용
- ✅ 의존성 최소화로 안정성 향상

### 3.2 Feature 2: 엑셀 다운로드 (Excel Export)

#### 3.2.1 기능 설명
**목적**: 현재 필터된 데이터를 엑셀 파일로 다운로드

#### 3.2.2 다운로드 데이터 구조
```typescript
interface ExcelData {
  '나이': string;           // "25세"
  '연락처': string;         // "010-1234-5678" (마스킹 해제)
  '지역': string;           // "서울시 강남구"
  '대출금액': string;       // "₩50,000,000"
  '취업상태': string;       // "재직중" | "미취업"
  '신청일시': string;       // "2024-12-15 14:30:25"
  '상태': string;           // "대기중" | "연락완료" | "상담중" | "상담완료" | "취소"
}
```

#### 3.2.3 파일명 규칙
- **형식**: `대출신청목록_[필터조건]_YYYY-MM-DD_HHMM.xlsx`
- **예시**: 
  - `대출신청목록_이번주_2024-12-15_1430.xlsx`
  - `대출신청목록_2024-12-01~2024-12-15_2024-12-15_1430.xlsx`

#### 3.2.4 구현 요구사항
- ✅ xlsx 라이브러리 사용
- ✅ 현재 필터 조건 반영
- ✅ 연락처 마스킹 해제 (엑셀에서는 전체 번호)
- ✅ 한글 헤더 및 데이터 포맷팅
- ✅ 다운로드 진행 상태 표시

### 3.3 Feature 3: ID 컬럼 제거 (UI Simplification)

#### 3.3.1 기능 설명
**현재**: ID 컬럼이 테이블 첫 번째 위치
**개선**: ID 컬럼 완전 제거로 화면 공간 효율성 증대

#### 3.3.2 제거 이유
- **불필요성**: 관리자가 ID를 직접 확인할 필요 없음
- **공간 효율**: 더 중요한 정보에 공간 할당
- **가독성**: 테이블 복잡도 감소

#### 3.3.3 대체 방안
- **고유 식별**: React key는 여전히 `application.id` 사용
- **디버깅**: 개발자 도구에서 확인 가능
- **데이터 무결성**: 백엔드 처리에는 영향 없음

## 4. 비기능 요구사항

### 4.1 성능 요구사항
- **날짜 필터링**: 응답시간 3초 이내
- **엑셀 다운로드**: 1000건 기준 5초 이내
- **UI 반응성**: 필터 변경 시 즉시 로딩 상태 표시

### 4.2 사용성 요구사항 (1~2인 최적화)
- **직관적 인터페이스**: 별도 교육 없이 사용 가능
- **키보드 단축키**: 자주 사용하는 필터 빠른 접근
- **상태 유지**: 브라우저 새로고침 시 필터 상태 유지

### 4.3 호환성 요구사항
- **브라우저**: Chrome, Safari, Firefox 최신 버전
- **엑셀**: Excel 2016 이상, Google Sheets 호환
- **모바일**: 태블릿에서 기본 사용 가능

## 5. 구현 일정

### 5.1 Phase 2.1: 기본 기능 구현 (1일)
- [ ] xlsx 라이브러리 설치
- [ ] ID 컬럼 제거 (즉시 적용)
- [ ] 엑셀 다운로드 기본 기능
- [ ] 날짜 필터 UI 구현

### 5.2 Phase 2.2: 고도화 (0.5일)
- [ ] 날짜 필터 백엔드 연동
- [ ] URL 상태 관리
- [ ] 에러 처리 및 로딩 상태

### 5.3 Phase 2.3: 테스트 및 최적화 (0.5일)
- [ ] 기능 테스트
- [ ] 성능 최적화
- [ ] 사용자 피드백 반영

## 6. 기술 구현 방안

### 6.1 날짜 필터링
```typescript
// 상태 관리
const [dateFilter, setDateFilter] = useState<{
  preset: DateFilterPreset;
  startDate?: Date;
  endDate?: Date;
}>({ preset: 'thisWeek' });

// API 호출
const fetchFilteredData = async (filter: DateFilter) => {
  const { startDate, endDate } = getDateRange(filter);
  return supabase
    .from(tableName)
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });
};
```

### 6.2 엑셀 다운로드
```typescript
import * as XLSX from 'xlsx';

const downloadExcel = () => {
  const excelData = filteredApplications.map(app => ({
    '나이': `${app.age}세`,
    '연락처': app.phone_number, // 마스킹 해제
    '지역': app.location,
    '대출금액': formatCurrency(app.loan_amount),
    '취업상태': app.employed ? '재직중' : '미취업',
    '신청일시': new Date(app.created_at).toLocaleString('ko-KR'),
    '상태': getStatusLabel(app.status)
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '신청목록');
  
  const fileName = generateFileName(dateFilter);
  XLSX.writeFile(workbook, fileName);
};
```

## 7. 1~2인 관리자 최적화 특징

### 7.1 간소화된 인터페이스
- **복잡한 권한 관리 없음**: 모든 기능 즉시 접근
- **최소한의 설정**: 기본값으로 바로 사용 가능
- **직관적 레이아웃**: 학습 곡선 최소화

### 7.2 실무 중심 기능
- **자주 사용하는 필터**: 오늘, 이번 주, 이번 달 우선
- **빠른 데이터 내보내기**: 원클릭 엑셀 다운로드
- **핵심 정보 집중**: 불필요한 데이터 제거

### 7.3 유지보수 최소화
- **단일 파일 구조**: 복잡한 컴포넌트 분리 없음
- **외부 의존성 최소**: 검증된 라이브러리만 사용
- **자동화된 기능**: 수동 설정 최소화

## 8. 리스크 및 고려사항

### 8.1 기술적 리스크 (낮음)
- **xlsx 라이브러리**: 안정성 검증됨
- **날짜 처리**: 표준 Date API 사용
- **성능**: 소규모 데이터 대상으로 문제없음

### 8.2 사용성 리스크 (낮음)
- **학습 곡선**: 기존 UI 패턴 유지
- **데이터 손실**: 필터링은 조회만, 원본 데이터 보존

### 8.3 구현 중 발생한 기술적 이슈 및 해결

#### 8.3.1 ShadCN Calendar 의존성 오류

**🚨 발생한 문제**
```
Error: Cannot find module './vendor-chunks/react-day-picker.js'
Require stack: .next/server/webpack-runtime.js
```

**🔍 근본 원인 분석**
1. **의존성 체인 불완전성**
   - ShadCN Calendar 컴포넌트 → `react-day-picker` 라이브러리 의존
   - `npx shadcn@latest add calendar` 명령어가 의존성을 완전히 설치하지 못함
   - Next.js SSR 환경에서 모듈 해석 실패

2. **오류 발생 메커니즘**
   ```
   컴포넌트 임포트 ✅ → Calendar 내부 의존성 로딩 ❌ → SSR 빌드 실패 ❌
   ```

3. **환경별 차이점**
   - **개발 환경**: 런타임 모듈 해석으로 즉시 오류 노출
   - **SSR 컨텍스트**: 모든 의존성이 빌드 타임에 해석되어야 함

**💡 해결 방안 검토**

| 방안 | 장점 | 단점 | 선택 여부 |
|------|------|------|-----------|
| `react-day-picker` 수동 설치 | 원본 기능 유지 | 추가 의존성, 번들 크기 증가, 복잡한 API | ❌ |
| HTML5 `<input type="date">` 사용 | 의존성 제로, 브라우저 네이티브, 성능 우수 | 스타일링 제약 | ✅ **채택** |

**🛠️ 최종 구현 방식**

**기존 설계 (문제 발생)**:
```tsx
// 복잡한 의존성 체인
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="h-4 w-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar mode="range" ... />  // react-day-picker 의존성 오류
  </PopoverContent>
</Popover>
```

**개선된 구현 (문제 해결)**:
```tsx
// 브라우저 네이티브 솔루션
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

{showCustomDatePicker && (
  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <Label htmlFor="start-date">시작 날짜</Label>
        <Input
          id="start-date"
          type="date"
          value={customStartDate}
          onChange={(e) => setCustomStartDate(e.target.value)}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="end-date">종료 날짜</Label>
        <Input
          id="end-date"
          type="date"
          value={customEndDate}
          onChange={(e) => setCustomEndDate(e.target.value)}
        />
      </div>
      <Button onClick={handleCustomDateApply}>적용</Button>
    </div>
  </div>
)}
```

**📊 해결 결과 비교**

| 항목 | 기존 (Calendar) | 개선 (HTML5 Input) |
|------|-----------------|---------------------|
| **의존성** | react-day-picker 필요 | 의존성 제로 |
| **번들 크기** | +50KB | 0KB |
| **브라우저 지원** | 라이브러리 의존 | 모든 모던 브라우저 |
| **모바일 UX** | 커스텀 UI | 네이티브 날짜 선택기 |
| **유지보수** | 라이브러리 업데이트 필요 | 브라우저 표준 |
| **성능** | 추가 JS 로딩 | 네이티브 성능 |

**🎯 비즈니스 임팩트**
- ✅ **개발 속도**: 의존성 문제 해결로 즉시 배포 가능
- ✅ **사용자 경험**: 모바일에서 더 나은 네이티브 날짜 선택 경험
- ✅ **유지보수성**: 외부 라이브러리 의존성 제거로 안정성 향상
- ✅ **성능**: 번들 크기 감소로 로딩 속도 개선

**📚 교훈 및 예방책**

1. **의존성 관리 베스트 프랙티스**
   - ShadCN 컴포넌트 설치 후 즉시 개발 서버 재시작하여 테스트
   - `package.json`에서 필요한 패키지 존재 여부 명시적 확인
   - 복잡한 컴포넌트 사용 시 브라우저 네이티브 대안 우선 고려

2. **Next.js 프로젝트 주의사항**
   - SSR 환경에서는 모든 의존성이 서버에서 해석 가능해야 함
   - 개발 환경에서의 오류가 프로덕션 빌드 실패로 이어질 수 있음
   - ShadCN 컴포넌트는 때로 숨겨진 의존성을 가질 수 있음

3. **설계 원칙 재확인**
   ```
   복잡한 외부 라이브러리 < 브라우저 네이티브 기능
   ```
   - 실용주의적 접근: 목표 달성을 위한 가장 단순하고 안정적인 방법 선택
   - 의존성 최소화: 외부 라이브러리보다 웹 표준 우선

#### 8.3.2 자동 새로고침 필터 리셋 문제

**🚨 발생한 문제**
```
문제: 사용자가 날짜 필터를 설정한 후 30초가 지나면 필터가 기본값으로 리셋됨
결과: "선택한 기간에 신청 데이터가 없습니다" 메시지 표시, 필터 설정이 무효화됨
```

**🔍 근본 원인 분석**
1. **자동 새로고침 로직 문제**
   ```typescript
   // 문제가 있는 코드
   useEffect(() => {
     fetchDashboardData();
     const interval = setInterval(() => fetchDashboardData(true), 30000);
     return () => clearInterval(interval);
   }, []);
   ```

2. **필터 상태 관리 문제**
   - 자동 새로고침: `fetchDashboardData(true)` → `filter` 파라미터 없음
   - 필터 정보 손실: `currentFilter = filter || dateFilter` → 클로저 문제로 구 상태 참조
   - 상태 동기화 실패: useEffect 의존성 배열이 필터 변경을 감지하지 못함

3. **문제 시나리오**
   ```
   사용자 필터 설정 → 30초 대기 → 자동 새로고침 실행 → 필터 무시 → 기본 데이터 표시
   ```

**💡 해결 방안**

| 접근법 | 장점 | 단점 | 선택 여부 |
|--------|------|------|-----------|
| useEffect 의존성에 dateFilter 추가 | 단순 | 무한 재렌더링 위험 | ❌ |
| useRef로 최신 상태 참조 | 성능 우수, 안정적 | 약간 복잡 | ✅ **채택** |
| 컨텍스트 API 사용 | 전역 상태 관리 | 과도한 엔지니어링 | ❌ |

**🛠️ 최종 구현 방식**

**기존 문제 코드**:
```typescript
const [dateFilter, setDateFilter] = useState({ preset: 'thisWeek' });

const fetchDashboardData = async (isRefresh = false, filter?: DateFilter) => {
  const currentFilter = filter || dateFilter; // 클로저 문제
  // ...
};

useEffect(() => {
  fetchDashboardData();
  const interval = setInterval(() => fetchDashboardData(true), 30000); // 필터 누락
  return () => clearInterval(interval);
}, []); // 의존성 부족
```

**개선된 해결 코드**:
```typescript
const [dateFilter, setDateFilter] = useState({ preset: 'thisWeek' });

// useRef로 최신 필터 상태 항상 참조
const dateFilterRef = useRef<DateFilter>(dateFilter);
dateFilterRef.current = dateFilter;

const fetchDashboardData = useCallback(async (isRefresh = false, filter?: DateFilter) => {
  // 자동 새로고침시 최신 필터 상태 사용, 수동 호출시 전달받은 필터 우선
  const currentFilter = filter || dateFilterRef.current;
  // ...
}, []); // 함수 재생성 방지

useEffect(() => {
  fetchDashboardData();
  
  // 자동 새로고침 - 현재 필터 상태를 유지하면서 30초마다 실행
  const interval = setInterval(() => {
    fetchDashboardData(true); // dateFilterRef.current 자동 사용
  }, 30000);
  
  return () => clearInterval(interval);
}, [fetchDashboardData]); // fetchDashboardData를 의존성에 추가
```

**📊 해결 결과**

| 상황 | 기존 동작 | 개선된 동작 |
|------|-----------|-------------|
| **필터 설정 후 30초** | 기본값으로 리셋 ❌ | 설정된 필터 유지 ✅ |
| **연속 필터 변경** | 30초마다 리셋 ❌ | 최신 필터 항상 적용 ✅ |
| **페이지 새로고침** | 기본값으로 복귀 ⚠️ | 기본값으로 복귀 ⚠️ |
| **수동 새로고침** | 현재 필터 유지 ✅ | 현재 필터 유지 ✅ |

**🎯 비즈니스 임팩트**
- ✅ **사용자 경험**: 필터 설정이 예기치 않게 사라지지 않음
- ✅ **업무 효율성**: 30초마다 필터를 다시 설정할 필요 없음
- ✅ **신뢰성**: 관리자가 시스템을 신뢰하고 지속 사용 가능
- ✅ **실시간성**: 자동 새로고침 기능은 유지하면서 필터도 보존

**📚 기술적 교훈**
1. **React Hook 조합 패턴**
   - `useRef`: 리렌더링 없이 최신 값 참조
   - `useCallback`: 함수 재생성 방지 및 의존성 관리
   - `useEffect`: 올바른 의존성 배열로 안정적인 사이드 이펙트

2. **상태 관리 베스트 프랙티스**
   ```
   상태 변경 → Ref 업데이트 → 자동 새로고침에서 최신 상태 사용
   ```
   - 상태와 Ref의 동기화로 클로저 문제 해결
   - 자동화된 동작에서도 사용자 설정 보존

**🔄 구현 상태 업데이트**

#### 3.1.4 구현 요구사항 (수정됨)
- ~~✅ ShadCN Select + DatePicker 조합~~ → **✅ ShadCN Select + HTML5 Date Input 조합**
- ✅ 실시간 필터링 (API 호출)
- ✅ URL 상태 유지 (새로고침 시 필터 유지)
- ✅ 로딩 상태 표시
- **✅ 브라우저 네이티브 날짜 선택기 활용** (추가)
- **✅ 의존성 최소화로 안정성 향상** (추가)

## 9. 성공 기준

### 9.1 기능적 성공 기준
- ✅ 모든 날짜 필터 옵션 정상 동작
- ✅ 엑셀 다운로드 파일 정상 생성
- ✅ ID 컬럼 제거 후 기능 이상 없음

### 9.2 사용자 경험 성공 기준
- ✅ 1~2인 관리자가 즉시 활용 가능
- ✅ 일일 업무 효율성 체감 개선
- ✅ 추가 교육 없이 직관적 사용

---

**문서 버전**: v1.0  
**작성일**: 2024년 12월  
**담당자**: 시니어 풀스택 개발자  
**승인자**: 1~2인 사업장 운영자  
**예상 완료일**: 2024년 12월 (2일 소요) 