# TagUs 🏷️

> 소중한 물건을 잊지 마세요 - 분실물 관리 앱

TagUs는 Google Gemini AI를 사용하여 사진을 찍으면 물건을 자동으로 인식하고, 사용자의 메모와 함께 관리해주는 모바일 우선 웹 애플리케이션입니다.

## ✨ 주요 기능

- 🤖 **AI 물건 인식**: Google Gemini Vision API를 사용하여 사진에서 물건 자동 인식
- 📝 **메모 관리**: 사용자의 메모를 로컬 스토리지와 Firebase에 저장
- 📍 **위치 기반 관리**: 현재 위치(역명, 보관함 번호) 설정
- 🎨 **Tailwind CSS**: 모던하고 반응형인 디자인
- ⚡ **성능 최적화**: React.lazy, memo, 코드 스플리팅
- 🔒 **타입 안전성**: TypeScript 기반 완전한 타입 지원
- 🧪 **테스트**: Vitest와 React Testing Library로 테스트 커버리지 제공
- 🌐 **영구 저장**: Firebase Authentication & Firestore 연동

## 🚀 빠른 시작

### 전제 조건

- Node.js 20 이상
- npm, yarn, 또는 pnpm

### 설치

```bash
# 클론
git clone https://github.com/your-username/tagus.git
cd tagus

# 의존성 설치
npm install

# .env 파일 생성
cp .env.example .env
```

### 환경 변수 설정

`.env` 파일에 다음 환경 변수를 추가하세요:

```env
# Gemini API Key (server)
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL for CORS (server)
FRONTEND_URL=http://localhost:5173

# Firebase Configuration (Firebase 프로젝트에서 가져오세요)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_BASE_URL=/api
```

### 개발 서버 실행

```bash
npm run dev
```

앱이 http://localhost:5173에서 열립니다.

## 📦 스크립트

```bash
# 개발 서버 실행
npm run dev

# API 서버 실행 (Gemini 프록시)
npm run dev:server

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview

# Linter 실행
npm run lint

# Linter 자동 수정
npm run lint:fix

# Prettier 포맷
npm run format

# Prettier 체크
npm run format:check

# 테스트 실행
npm test

# 테스트 UI
npm run test:ui

# 테스트 커버리지
npm run test:coverage
```

## 🏗️ 아키텍처

```
src/
├── components/        # React 컴포넌트
│   ├── Home/        # 홈 화면 컴포넌트
│   ├── Layout/      # 레이아웃 컴포넌트
│   ├── Navigation/  # 네비게이션 컴포넌트
│   └── common/      # 공통 컴포넌트
├── contexts/         # React Context (Toast 등)
├── firebase/         # Firebase 서비스
│   ├── config.ts     # Firebase 설정
│   ├── items.ts      # Items 서비스
│   ├── memo.ts       # Memo 서비스
│   └── location.ts   # Location 서비스
├── stores/           # Zustand 스토어
├── services/         # API 서비스
├── utils/            # 유틸리티 함수
└── test/            # 테스트 설정
```

## 🛠️ 기술 스택

### 프론트엔드

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Zustand** - 상태 관리
- **Swiper** - 캐러셀

### 백엔드

- **Firebase** - BaaS (Authentication, Firestore, Storage)
- **Google Gemini** - AI 이미지 인식

### 개발 도구

- **Vitest** - 테스트 러너
- **React Testing Library** - 컴포넌트 테스트
- **ESLint** - Linter
- **Prettier** - 코드 포맷터
- **Husky** - Git hooks
- **lint-staged** - Staged 파일 린트

## 🧪 테스트

```bash
# 모든 테스트 실행
npm test

# 테스트 UI로 실행
npm run test:ui

# 커버리지 보고서 생성
npm run test:coverage
```

## 📝 컨벤션

### Git Commit 메시지

이 프로젝트는 Conventional Commits를 사용합니다:

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 업데이트
- `style`: 코드 스타일 변경 (로직 수정 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/도구 변경

### 코드 스타일

- **Prettier**: 코드 포맷팅
- **ESLint**: 코드 린팅
- **TypeScript Strict Mode**: 엄격한 타입 체크

## 🌐 배포

이 프로젝트는 GitHub Actions를 사용하여 CI/CD를 자동화합니다:

1. **Push**: 코드를 푸시하면 자동으로 테스트와 빌드가 실행됩니다.
2. **PR**: Pull Request에서도 테스트와 빌드가 실행됩니다.
3. **Deploy**: `master` 또는 `main` 브랜치에 푸시하면 Firebase에 자동 배포됩니다.

### 수동 배포

```bash
# 빌드
npm run build

# Firebase 배포 (firebase-tools 설치 필요)
firebase deploy --only hosting
```

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 기여

기여를 환영합니다! 다음 단계를 따르세요:

1. Fork 이 프로젝트
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경 사항 커밋 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 브랜치 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📞 연락처

질문이나 제안이 있으시면 [이슈](https://github.com/your-username/tagus/issues)를 생성하세요.

---

⭐ 만약 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!
