# 로컬 개발 환경에서 Vercel 배포까지의 체크리스트

## ✅ CSS 깨짐 방지 및 안전한 배포를 위한 실행 순서

### 🧩 [1] 로컬 코드 정리 상태 확인

```bash
git status
```

- 변경 사항이 있으면 커밋 먼저:

```bash
git add .
git commit -m "chore: 문자인증 포함 최종 정리"
```

---

### 🔁 [2] CSS 설정 재점검 (사전 예방 핵심)

#### ⬜ tailwind.config.ts
- content 경로에 `./app/`, `./components/` 포함
- `important: true` 설정
- safelist에 동적 클래스 추가

#### ⬜ postcss.config.js

```js
plugins: {
  tailwindcss: {},
  autoprefixer: {},
  cssnano: { preset: 'default' } // 항상 활성화
}
```

#### ⬜ app/layout.tsx
- `import './globals.css'` ← 반드시 상대 경로로

---

### 🧪 [3] Preview 브랜치 테스트 배포

1. 새 브랜치 생성

```bash
git checkout -b predeploy-check
git push origin predeploy-check
```

2. Vercel Preview URL 생성 → CSS, 문자인증 둘 다 확인

---

### 🛠 [4] 확인 결과 문제 없을 경우 → 정식 배포 준비

1. 브랜치 병합

```bash
git checkout main
git merge predeploy-check
git push origin main
```

2. 또는 직접 push 시:

```bash
git push origin main
```

---

### 🚀 [5] 강제 새 빌드로 배포 (캐시 무시)

```bash
vercel --prod --force
```

- Vercel 대시보드 → 배포 로그 확인
- 프로덕션 사이트 접속 → 최종 기능 & 스타일 확인

---

### ✅ [선택] 사후 리팩터링
- PR/CI 시스템 도입은 이후 안정화 단계에서 고려

---

## 📌 순서 정리 요약

| 단계 | 작업 내용 | 목적 |
|-----|----------|------|
| 1 | git commit 상태 확인 | 현재 로컬 코드 보존 |
| 2 | Tailwind & CSS 설정 점검 | CSS 깨짐 방지 |
| 3 | Preview 브랜치 배포 | 배포 전 실제 확인 |
| 4 | main 병합 & GitHub 푸시 | Vercel 자동 배포 트리거 |
| 5 | vercel --prod --force | 캐시 무시하고 새 빌드 |
| 6 | 사이트 접속 & 기능 검수 | 실 배포 검증 |

## SEO 및 검색엔진 최적화 파일 관리

- 본 프로젝트는 단일 SPA(Single Page Application) 구조이므로, sitemap.xml, robots.txt 등은 public 폴더에 정적으로 관리한다.
- Next.js app/ 내 동적 라우트(route.ts) 방식은 사용하지 않는다.
- 필요시 public/sitemap.xml, public/robots.txt 파일을 직접 작성 및 수정한다. 