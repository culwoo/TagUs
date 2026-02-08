# API 문서

## 개요

TagUs 앱은 RESTful API와 Firebase를 사용하여 데이터를 관리합니다.

## 인증

이 앱은 Firebase Authentication을 사용합니다.

### Google 로그인

```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase/config';

const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);
```

### 로그아웃

```typescript
import { signOut } from 'firebase/auth';
import { auth } from './firebase/config';

await signOut(auth);
```

## Items API

### 아이템 목록 가져오기

```typescript
import { itemService } from './firebase/items';

const items = await itemService.getItems(userId);
```

**응답:**

```typescript
Item[]
```

### 아이템 추가

```typescript
import { itemService } from './firebase/items';

const newItem = await itemService.addItem(userId, {
  name: 'New Item',
  image: 'https://example.com/image.jpg'
});
```

**요청:**

```typescript
{
  name: string;
  image: string;
}
```

**응답:**

```typescript
{
  id: number;
  name: string;
  image: string;
}
```

### 아이템 업데이트

```typescript
import { itemService } from './firebase/items';

await itemService.updateItem(userId, itemId, {
  name: 'Updated Name'
});
```

### 아이템 삭제

```typescript
import { itemService } from './firebase/items';

await itemService.deleteItem(userId, itemId);
```

## Memo API

### 메모 가져오기

```typescript
import { memoService } from './firebase/memo';

const memo = await memoService.getMemo(userId);
```

**응답:**

```typescript
string
```

### 메모 저장

```typescript
import { memoService } from './firebase/memo';

await memoService.saveMemo(userId, 'My memo content');
```

**요청:**

```typescript
{
  content: string;
}
```

## Location API

### 위치 가져오기

```typescript
import { locationService } from './firebase/location';

const location = await locationService.getLocation(userId);
```

**응답:**

```typescript
{
  name: string;
  station: string;
  boxNumber: string;
}
```

### 위치 업데이트

```typescript
import { locationService } from './firebase/location';

await locationService.updateLocation(userId, {
  name: '현재위치',
  station: '서울역 4호선',
  boxNumber: '분실물 보관함 230번'
});
```

**요청:**

```typescript
{
  name: string;
  station: string;
  boxNumber: string;
}
```

## AI 이미지 인식

### 아이템 인식

```typescript
import { api } from './services/api';

const result = await api.identifyItem({
  imageFile: file
});
```

**요청:**

```typescript
{
  imageFile: File;
}
```

**응답:**

```typescript
{
  itemName: string;
  originalImageUrl: string;
}
```

## 백그라운드 제거

### 이미지 배경 제거

```typescript
import { api } from './services/api';

const result = await api.removeBackground({
  imageFile: file,
  method: 'ai' // 'rembg' | 'grabcut' | 'ai'
});
```

**요청:**

```typescript
{
  imageFile: File;
  method?: 'rembg' | 'grabcut' | 'ai';
}
```

**응답:**

```typescript
{
  processedImageUrl: string;
  originalImageUrl: string;
}
```

## 에러 응답

모든 API 에러는 다음 형식을 따릅니다:

```typescript
{
  message: string;
  statusCode?: number;
  details?: unknown;
}
```

### 에러 타입

- `APIError`: API 요청 실패
- `NetworkError`: 네트워크 오류
- `ValidationError`: 입력 검증 실패
- `AuthenticationError`: 인증 실패

## Rate Limiting

- **일반 요청**: 15분당 100개 요청
- **이미지 처리**: 15분당 10개 요청

Rate limit 초과 시:

```json
{
  "message": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
}
```

## 보안 헤더

모든 응답에는 다음 보안 헤더가 포함됩니다:

- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `X-XSS-Protection`: 1; mode=block
- `Strict-Transport-Security`: max-age=31536000; includeSubDomains
