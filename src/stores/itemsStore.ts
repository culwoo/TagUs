import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { itemService } from '../firebase/items';
import { useAuthStore } from './authStore';
import { useActivityStore } from './activityStore';
import { useNotificationStore } from './notificationStore';
import {
  createDefaultItemLocation,
  normalizeItem,
  type Item,
  type ItemLocation,
  type ItemStatus,
} from '../../shared/domain';
import { MAX_ITEM_NAME_LENGTH } from '../constants/item';

export type { Item, ItemLocation, ItemStatus } from '../../shared/domain';

interface ItemsStore {
  items: Item[];
  addItem: (item: Item) => Promise<void>;
  updateItemName: (itemId: number, newName: string) => Promise<void>;
  updateItemImage: (itemId: number, newImageUrl: string, storagePath?: string) => Promise<void>;
  updateItemLocation: (itemId: number, location: ItemLocation) => Promise<void>;
  updateItemStatus: (itemId: number, status: ItemStatus) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  setItems: (items: Item[]) => void;
}

const getUserId = () => useAuthStore.getState().user?.uid;

const withUpdatedAt = <T extends Partial<Item>>(updates: T): T & { updatedAt: number } => ({
  ...updates,
  updatedAt: Date.now(),
});

const normalizeItemName = (name: string) => name.trim().slice(0, MAX_ITEM_NAME_LENGTH);

const pushNotificationSafely = (
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error'
) => {
  void useNotificationStore
    .getState()
    .addNotification(title, message, type)
    .catch(error => {
      console.error('Failed to push notification:', error);
    });
};

export const useItemsStore = create<ItemsStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async item => {
        const previousItems = get().items;
        const normalizedName = normalizeItemName(item.name);
        if (!normalizedName) {
          throw new Error('아이템 이름을 입력해주세요.');
        }

        const normalized = normalizeItem(
          { ...item, name: normalizedName },
          item.location ?? createDefaultItemLocation()
        );
        set(state => ({ items: [...state.items, normalized] }));

        try {
          const userId = getUserId();
          if (userId) {
            await itemService.addItem(userId, normalized);
          }
          useActivityStore.getState().addActivity('item.add', `아이템 추가: ${normalized.name}`);
          pushNotificationSafely(
            '아이템 추가',
            `"${normalized.name}" 아이템이 등록되었습니다.`,
            'success'
          );
        } catch (error) {
          set({ items: previousItems });
          throw error;
        }
      },
      updateItemName: async (itemId, newName) => {
        const normalizedName = normalizeItemName(newName);
        if (!normalizedName) {
          throw new Error('아이템 이름을 입력해주세요.');
        }

        const previousItems = get().items;
        const updates = withUpdatedAt({ name: normalizedName });
        set(state => ({
          items: state.items.map(item => (item.id === itemId ? { ...item, ...updates } : item)),
        }));

        try {
          const userId = getUserId();
          if (userId) {
            await itemService.updateItem(userId, itemId, updates);
          }
          useActivityStore
            .getState()
            .addActivity('item.update', `아이템 이름 변경: ${normalizedName}`);
          pushNotificationSafely(
            '아이템 수정',
            `이름이 "${normalizedName}"(으)로 변경되었습니다.`,
            'info'
          );
        } catch (error) {
          set({ items: previousItems });
          throw error;
        }
      },
      updateItemImage: async (itemId, newImageUrl, storagePath) => {
        const previousItems = get().items;
        const updates = withUpdatedAt({ image: newImageUrl, storagePath });
        set(state => ({
          items: state.items.map(item => (item.id === itemId ? { ...item, ...updates } : item)),
        }));

        try {
          const userId = getUserId();
          if (userId) {
            await itemService.updateItem(userId, itemId, updates);
          }
          useActivityStore.getState().addActivity('item.update', '아이템 이미지 업데이트');
          pushNotificationSafely('아이템 수정', '아이템 이미지가 업데이트되었습니다.', 'info');
        } catch (error) {
          set({ items: previousItems });
          throw error;
        }
      },
      updateItemLocation: async (itemId, location) => {
        const previousItems = get().items;
        const updates = withUpdatedAt({ location });
        set(state => ({
          items: state.items.map(item => (item.id === itemId ? { ...item, ...updates } : item)),
        }));

        try {
          const userId = getUserId();
          if (userId) {
            await itemService.updateItem(userId, itemId, updates);
          }
          useActivityStore.getState().addActivity('location.update', '아이템 위치 업데이트');
          pushNotificationSafely('위치 업데이트', '아이템 보관 위치가 업데이트되었습니다.', 'info');
        } catch (error) {
          set({ items: previousItems });
          throw error;
        }
      },
      updateItemStatus: async (itemId, status) => {
        const previousItems = get().items;
        const updates = withUpdatedAt({ status });
        set(state => ({
          items: state.items.map(item => (item.id === itemId ? { ...item, ...updates } : item)),
        }));

        try {
          const userId = getUserId();
          if (userId) {
            await itemService.updateItem(userId, itemId, updates);
          }
          useActivityStore.getState().addActivity('item.update', `아이템 상태 변경: ${status}`);
          pushNotificationSafely(
            '상태 업데이트',
            `아이템 상태가 ${status}(으)로 변경되었습니다.`,
            'info'
          );
        } catch (error) {
          set({ items: previousItems });
          throw error;
        }
      },
      removeItem: async itemId => {
        const previousItems = get().items;
        const targetItem = get().items.find(item => item.id === itemId);
        set(state => ({
          items: state.items.filter(item => item.id !== itemId),
        }));

        try {
          const userId = getUserId();
          if (userId) {
            await itemService.deleteItem(userId, itemId, targetItem?.storagePath);
          }
          useActivityStore.getState().addActivity('item.remove', '아이템 삭제');
          pushNotificationSafely('아이템 삭제', '아이템이 삭제되었습니다.', 'warning');
        } catch (error) {
          set({ items: previousItems });
          throw error;
        }
      },
      setItems: items => set({ items: items.map(item => normalizeItem(item, item.location)) }),
    }),
    {
      name: 'tagus-items-storage',
      version: 2,
      migrate: persistedState => {
        const typedState = persistedState as { items?: Item[] } | undefined;
        if (!typedState?.items) {
          return { items: [] };
        }

        return {
          items: typedState.items.map(item => normalizeItem(item, item.location)),
        };
      },
    }
  )
);
