# 아키텍처 문서

## 시스템 개요

TagUs는 클라이언트-서버 아키텍처를 따르는 모바일 우선 웹 애플리케이션입니다.

```
┌─────────────────────────────────────────────────────────────┐
│                         사용자                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      React 앱 (클라이언트)              │
│  ┌──────────────┐  ┌──────────┐  ┌─────────────────┐   │
│  │  컴포넌트    │  │  스토어   │  │   유틸리티     │   │
│  │              │  │  (Zustand)│  │                 │   │
│  │  - Header   │  │          │  │ - 검증         │   │
│  │  - Carousel │  │ - Items │  │ - 로깅         │   │
│  │  - Memo    │  │ - Memo │  │ - 이미지 처리    │   │
│  │  - Nav     │  │ - Loc.  │  │                 │   │
│  └──────────────┘  └──────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         API 계층                          │
│  ┌──────────────┐  ┌──────────┐  ┌─────────────────┐   │
│  │ Firebase     │  │  Gemini  │  │  Axios Client  │   │
│  │              │  │  Vision  │  │                 │   │
│  │ - Auth       │  │          │  │ - 인터셉터     │   │
│  │ - Firestore │  │ - 이미지 │  │ - 에러 처리     │   │
│  │ - Storage   │  │  인식    │  │ - 토큰 갱신   │   │
│  └──────────────┘  └──────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 기술 스택

### 프론트엔드

| 기술           | 용도                           |
| -------------- | ------------------------------ |
| React 19       | UI 라이브러리                  |
| TypeScript     | 타입 안전성                    |
| Vite          | 빌드 도구                      |
| Tailwind CSS   | 스타일링                       |
| Zustand        | 상태 관리                      |
| Swiper        | 캐러셀                         |
| Axios         | HTTP 클라이언트                 |
| React.lazy    | 코드 스플리팅                  |
| React.memo    | 렌더링 최적화                  |

### 백엔드

| 기술           | 용도                           |
| -------------- | ------------------------------ |
| Firebase       | BaaS (Auth, Firestore, Storage) |
| Gemini AI      | 이미지 인식                     |

### 개발 도구

| 기술              | 용도                    |
| ----------------- | ----------------------- |
| Vitest            | 테스트 러너            |
| RTL               | 컴포넌트 테스트        |
| ESLint            | Linter                  |
| Prettier           | 포맷터                 |
| Husky             | Git hooks               |
| lint-staged        | Staged 파일 린트       |
| GitHub Actions     | CI/CD                  |

## 디렉토리 구조

```
src/
├── components/           # React 컴포넌트
│   ├── Home/           # 홈 화면
│   │   ├── Header.tsx
│   │   ├── ItemCarousel.tsx
│   │   └── MemoSection.tsx
│   ├── Layout/         # 레이아웃
│   │   └── MobileLayout.tsx
│   ├── Navigation/     # 네비게이션
│   │   └── BottomNavBar.tsx
│   └── common/         # 공통 컴포넌트
│       └── ErrorBoundary.tsx
├── contexts/            # React Context
│   └── ToastContext.tsx
├── firebase/           # Firebase 서비스
│   ├── config.ts       # Firebase 초기화
│   ├── items.ts        # Items CRUD
│   ├── memo.ts         # Memo CRUD
│   └── location.ts     # Location CRUD
├── stores/             # Zustand 스토어
│   ├── itemsStore.ts
│   ├── memoStore.ts
│   └── locationStore.ts
├── services/           # API 서비스
│   ├── apiClient.ts    # Axios 설정
│   ├── api.ts          # API 메서드
│   └── errors.ts       # 에러 타입
├── utils/              # 유틸리티
│   ├── imageProcessing.ts
│   └── validation.ts
├── test/               # 테스트 설정
│   └── setup.ts
├── App.tsx             # 루트 컴포넌트
├── main.tsx            # 엔트리 포인트
└── index.css           # 글로벌 스타일
```

## 데이터 흐름

### 아이템 추가 흐름

```
1. 사용자가 + 버튼 클릭
   ↓
2. 파일 선택 (카메라/갤러리)
   ↓
3. 이미지 검증 (크기, 형식)
   ↓
4. Gemini Vision API로 이미지 분석
   ↓
5. 결과 반환 (아이템 이름)
   ↓
6. Firebase Storage에 이미지 업로드
   ↓
7. Firestore에 아이템 데이터 저장
   ↓
8. Zustand 스토어 업데이트
   ↓
9. UI 리렌더링
```

### 메모 저장 흐름

```
1. 사용자가 메모 입력
   ↓
2. 변경 감지 (onChange)
   ↓
3. Zustand 스토어 업데이트
   ↓
4. 로컬 스토리지 저장 (localStorage)
   ↓
5. (선택) Firestore 동기화
   ↓
6. 토스트 메시지 표시
```

## 상태 관리

### Zustand 스토어

| 스토어       | 목적                  | 지속성          |
| ------------ | --------------------- | --------------- |
| itemsStore  | 아이템 목록 관리       | localStorage     |
| memoStore   | 메모 내용 관리         | localStorage     |
| locationStore | 위치 정보 관리         | localStorage     |

### React Context

| Context       | 목적                  |
| ------------- | --------------------- |
| ToastContext  | 토스트 메시지 상태     |

## 보안

### 클라이언트

- 입력 검증 (Zod)
- XSS 방지 (React 기본)
- CSRF 방지 (Firebase)
- 헤더 보안 (HTTP 전용 쿠키)

### 서버

- CORS 설정
- Rate Limiting
- 보안 헤더
- 인증 토큰 검증

## 성능 최적화

### 코드 스플리팅

```typescript
const Header = lazy(() => import('./components/Home/Header'));
```

### 메모이제이션

```typescript
const MemoizedHeader = memo(Header);
```

### 이미지 최적화

- `loading="lazy"` 속성
- WebP 형식 지원
- 썸네일 생성 (예정)

### 번들 최적화

- Tree shaking
- Dead code 제거
- Code splitting

## 접근성

### WCAG 2.1 AA 준수

- ARIA 속성
- 키보드 네비게이션
- 포커스 관리
- 색상 대비
- 스크린 리더 지원

## 테스트

### 유닛 테스트

- 컴포넌트 테스트
- 유틸리티 테스트
- 스토어 테스트

### 통합 테스트

- Firebase 통합 테스트
- API 통합 테스트

### E2E 테스트

- Playwright (예정)

## 배포

### CI/CD 파이프라인

```
GitHub Actions
├── Pull Request
│   ├── Linting
│   ├── Formatting
│   ├── Testing
│   └── Building
└── Push to main/master
    ├── Linting
    ├── Formatting
    ├── Testing
    ├── Building
    └── Deploy to Firebase
```

## 미래 계획

- [ ] PWA 지원
- [ ] 오프라인 지원 (Service Worker)
- [ ] 다크 모드
- [ ] 다국어 지원 (i18n)
- [ ] E2E 테스트 (Playwright)
- [ ] 분석 (Google Analytics)
- [ ] 에러 추적 (Sentry)
- [ ] 백엔드 이미지 처리
