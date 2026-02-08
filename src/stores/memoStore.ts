import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MemoStore {
  memo: string;
  setMemo: (memo: string) => void;
}

export const useMemoStore = create<MemoStore>()(
  persist(
    (set) => ({
      memo: '',
      setMemo: (memo) => set({ memo }),
    }),
    {
      name: 'tagus-memo-storage',
    }
  )
);
