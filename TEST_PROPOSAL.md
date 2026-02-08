# Test Proposal for New Auth/Firestore Flows

This proposal outlines the strategy to add unit tests for the new Firebase-based services (`items.ts`, `memo.ts`, `location.ts`) without modifying the existing codebase yet.

## 1. Mocking Strategy

Since the application relies on `firebase/firestore`, `firebase/storage`, and `firebase/auth`, we need to mock these external dependencies to test our logic in isolation.

### `src/test/firebase-mocks.ts` (New File)
We will create a centralized mock setup to be used in `src/test/setup.ts` or individual test files.

```typescript
import { vi } from 'vitest';

export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
};

export const mockStorage = {
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
};

export const mockAuth = {
  getAuth: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
};
```

### Update `src/test/setup.ts`
Configure the mocks globally so they apply to all tests.

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { mockFirestore, mockStorage, mockAuth } from './firebase-mocks';

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: mockAuth.getAuth,
  signInWithPopup: mockAuth.signInWithPopup,
  GoogleAuthProvider: mockAuth.GoogleAuthProvider,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: mockFirestore.collection,
  doc: mockFirestore.doc,
  getDocs: mockFirestore.getDocs,
  getDoc: mockFirestore.getDoc,
  setDoc: mockFirestore.setDoc,
  updateDoc: mockFirestore.updateDoc,
  deleteDoc: mockFirestore.deleteDoc,
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: mockStorage.ref,
  uploadBytes: mockStorage.uploadBytes,
  getDownloadURL: mockStorage.getDownloadURL,
  deleteObject: mockStorage.deleteObject,
}));
```

## 2. Test Cases for `itemService`

File: `src/firebase/items.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { itemService } from './items';
import { mockFirestore, mockStorage } from '../test/firebase-mocks';

describe('itemService', () => {
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getItems', () => {
    it('should fetch and transform items correctly', async () => {
      const mockData = [
        { id: '1', data: () => ({ name: 'Item 1', image: 'img1.png' }) },
        { id: '2', data: () => ({ name: 'Item 2', image: 'img2.png' }) },
      ];
      
      mockFirestore.getDocs.mockResolvedValue({ docs: mockData });

      const items = await itemService.getItems(userId);

      expect(mockFirestore.collection).toHaveBeenCalled();
      expect(items).toHaveLength(2);
      expect(items[0]).toEqual({ id: 1, name: 'Item 1', image: 'img1.png' });
    });
  });

  describe('addItem', () => {
    it('should add an item with correct fields', async () => {
      const newItem = { name: 'New Item', image: 'new.png' };
      const mockDocRef = { id: 'new-doc-id' };
      
      mockFirestore.doc.mockReturnValue(mockDocRef);

      const result = await itemService.addItem(userId, newItem);

      expect(mockFirestore.setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          name: 'New Item',
          userId: userId,
          createdAt: expect.any(Number),
        })
      );
      expect(result.name).toBe('New Item');
    });
  });

  describe('uploadImage', () => {
    it('should upload image and return URL', async () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const mockUrl = 'https://example.com/test.png';

      mockStorage.uploadBytes.mockResolvedValue({});
      mockStorage.getDownloadURL.mockResolvedValue(mockUrl);

      const url = await itemService.uploadImage(userId, file);

      expect(mockStorage.uploadBytes).toHaveBeenCalled();
      expect(url).toBe(mockUrl);
    });
  });
});
```

## 3. Test Cases for `memoService`

File: `src/firebase/memo.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { memoService } from './memo';
import { mockFirestore } from '../test/firebase-mocks';

describe('memoService', () => {
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty string if memo does not exist', async () => {
    mockFirestore.getDoc.mockResolvedValue({
      exists: () => false,
    });

    const memo = await memoService.getMemo(userId);
    expect(memo).toBe('');
  });

  it('should return content if memo exists', async () => {
    mockFirestore.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ content: 'My Memo' }),
    });

    const memo = await memoService.getMemo(userId);
    expect(memo).toBe('My Memo');
  });

  it('should save memo', async () => {
    await memoService.saveMemo(userId, 'New Content');

    expect(mockFirestore.setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        content: 'New Content',
        userId: userId,
      })
    );
  });
});
```

## 4. Test Cases for `locationService`

File: `src/firebase/location.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { locationService } from './location';
import { mockFirestore } from '../test/firebase-mocks';

describe('locationService', () => {
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default location if not found', async () => {
    mockFirestore.getDoc.mockResolvedValue({
      exists: () => false,
    });

    const loc = await locationService.getLocation(userId);
    expect(loc.name).toBe('현재위치');
  });

  it('should update location', async () => {
    const newLoc = { name: 'Home', station: 'Station A', boxNumber: '1' };
    await locationService.updateLocation(userId, newLoc);

    expect(mockFirestore.setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining(newLoc)
    );
  });
});
```
