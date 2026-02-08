import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActivityType = 'item.add' | 'item.update' | 'item.remove' | 'memo.save' | 'location.update' | 'auth.signin' | 'auth.signout';

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: number;
}

interface ActivityStore {
  activities: Activity[];
  addActivity: (type: ActivityType, message: string) => void;
  clearActivities: () => void;
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set) => ({
      activities: [],
      addActivity: (type, message) =>
        set((state) => ({
          activities: [
            { id: `${Date.now()}-${Math.random()}`, type, message, timestamp: Date.now() },
            ...state.activities,
          ],
        })),
      clearActivities: () => set({ activities: [] }),
    }),
    {
      name: 'tagus-activity-storage',
    }
  )
);
