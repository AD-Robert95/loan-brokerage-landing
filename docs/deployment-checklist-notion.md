# 로컬 개발 → Vercel 배포 체크리스트

## CSS 깨짐 방지 및 안전한 배포 프로세스

### 단계 1: 로컬 코드 정리 확인
- [ ] `git status` 실행하여 변경 사항 확인
- [ ] 변경 사항 있을 경우 커밋:
  ```
  git add .
  git commit -m "chore: 문자인증 포함 최종 정리"
  ```

### 단계 2: CSS 설정 재점검
- [ ] tailwind.config.ts 확인
  - [ ] content 경로에 ./app/, ./components/ 포함됨
  - [ ] important: true 설정됨
  - [ ] safelist에 필요한 동적 클래스 추가됨
- [ ] postcss.config.js 확인
  - [ ] cssnano 항상 활성화 설정:
  ```js
  cssnano: { preset: 'default' }
  ```
- [ ] app/layout.tsx 확인
  - [ ] import './globals.css' 상대 경로 확인

### 단계 3: Preview 브랜치 테스트
- [ ] predeploy-check 브랜치 생성
  ```
  git checkout -b predeploy-check
  git push origin predeploy-check
  ```
- [ ] Vercel Preview 배포 확인
  - [ ] CSS 정상 로드 확인
  - [ ] 문자인증 기능 정상 작동 확인

### 단계 4: 프로덕션 배포 준비
- [ ] main 브랜치로 병합
  ```
  git checkout main
  git merge predeploy-check
  git push origin main
  ```

### 단계 5: 강제 새 빌드 배포
- [ ] vercel CLI로 강제 배포 실행
  ```
  vercel --prod --force
  ```
- [ ] Vercel 대시보드에서 배포 로그 확인
- [ ] 환경 변수 설정 확인
  - [ ] SOLAPI_API_KEY
  - [ ] SOLAPI_API_SECRET
  - [ ] SOLAPI_SENDER

### 단계 6: 최종 검증
- [ ] 프로덕션 사이트 접속
  - [ ] 모든 페이지 CSS 정상 확인
  - [ ] 문자인증 기능 정상 작동 확인
  - [ ] 콘솔 에러 없음 확인

## 문제 발생시 롤백 계획
- [ ] Vercel 대시보드 → Deployments → 이전 안정 버전 선택 → Redeploy
- [ ] GitHub에서 이전 안정 커밋으로 되돌리기:
  ```
  git reset --hard <안정_커밋_해시>
  git push -f origin main
  ``` 