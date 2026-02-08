import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatService, type ChatThread } from '../firebase/chat';
import { useAuthStore } from './authStore';

interface ChatStore {
  threads: ChatThread[];
  setThreads: (threads: ChatThread[]) => void;
  ensureDefaultThread: () => Promise<void>;
  upsertThread: (thread: ChatThread) => Promise<void>;
  clearThreads: () => void;
}

const getUserId = () => useAuthStore.getState().user?.uid;

const defaultThread = (): ChatThread => ({
  id: 'ready-for-finder-chat',
  itemId: null,
  title: '찾아준 사람과의 채팅 (준비됨)',
  preview: '분실물 매칭이 붙으면 이곳에서 1:1 대화를 시작합니다.',
  status: 'ready',
  updatedAt: Date.now(),
  createdAt: Date.now(),
});

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      threads: [],
      setThreads: (threads) => set({ threads }),
      ensureDefaultThread: async () => {
        if (get().threads.length > 0) {
          return;
        }
        await get().upsertThread(defaultThread());
      },
      upsertThread: async (thread) => {
        set((state) => {
          const existingIndex = state.threads.findIndex((item) => item.id === thread.id);
          if (existingIndex === -1) {
            return { threads: [thread, ...state.threads] };
          }

          const cloned = [...state.threads];
          cloned[existingIndex] = thread;
          return { threads: cloned.sort((a, b) => b.updatedAt - a.updatedAt) };
        });

        const userId = getUserId();
        if (userId) {
          await chatService.saveThread(userId, thread);
        }
      },
      clearThreads: () => set({ threads: [] }),
    }),
    {
      name: 'tagus-chat-storage',
    }
  )
);
