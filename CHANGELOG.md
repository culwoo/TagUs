# CHANGELOG

모든 주요 변경 사항은 이 파일에 기록됩니다.

## [Unreleased]

### 추가
- TypeScript 마이그레이션
- Zustand 상태 관리
- Tailwind CSS 스타일링
- Firebase 통합 (Auth, Firestore, Storage)
- Vitest 테스트 인프라
- React.lazy 코드 스플리팅
- React.memo 성능 최적화
- Error Boundary 컴포넌트
- Toast 알림 시스템
- ARIA 속성 및 접근성 개선
- 입력 검증 (Zod)
- CORS 및 Rate Limiting 설정
- Prettier, ESLint, Husky, lint-staged
- GitHub Actions CI/CD 파이프라인
- API 구조화 (axios)
- 로깅 시스템

### 변경
- 인라인 스타일 → Tailwind CSS 클래스
- alert() → Toast 컴포넌트
- prop drilling → Zustand 스토어
- .jsx/.js → .tsx/.ts

### 제거
- 레거시 인라인 스타일

## [0.0.0] - 2026-01-11

### 추가
- 초기 프로젝트 설정
- React + Vite 템플릿
- 기본 컴포넌트 구조
- Gemini Vision API 연동
- localStorage 기반 상태 저장
