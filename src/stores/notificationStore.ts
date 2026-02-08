import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { notificationService, type AppNotification, type NotificationType } from '../firebase/notifications';
import { useAuthStore } from './authStore';

interface NotificationStore {
  notifications: AppNotification[];
  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (title: string, message: string, type?: NotificationType) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  clearNotifications: () => void;
}

const getUserId = () => useAuthStore.getState().user?.uid;

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      addNotification: async (title, message, type = 'info') => {
        const notification: AppNotification = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          title,
          message,
          type,
          isRead: false,
          createdAt: Date.now(),
        };

        set((state) => ({ notifications: [notification, ...state.notifications] }));

        const userId = getUserId();
        if (userId) {
          await notificationService.saveNotification(userId, notification);
        }
      },
      markAsRead: async (notificationId) => {
        const target = get().notifications.find((notification) => notification.id === notificationId);
        if (!target || target.isRead) {
          return;
        }

        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId ? { ...notification, isRead: true } : notification
          ),
        }));

        const userId = getUserId();
        if (userId) {
          await notificationService.markAsRead(userId, notificationId);
        }
      },
      deleteNotification: async (notificationId) => {
        const previousNotifications = get().notifications;
        const target = previousNotifications.find((notification) => notification.id === notificationId);
        if (!target) {
          return;
        }

        set((state) => ({
          notifications: state.notifications.filter((notification) => notification.id !== notificationId),
        }));

        try {
          const userId = getUserId();
          if (userId) {
            await notificationService.deleteNotification(userId, notificationId);
          }
        } catch (error) {
          set({ notifications: previousNotifications });
          throw error;
        }
      },
      deleteAllNotifications: async () => {
        const previousNotifications = get().notifications;
        if (previousNotifications.length === 0) {
          return;
        }

        set({ notifications: [] });

        try {
          const userId = getUserId();
          if (userId) {
            await notificationService.deleteAllNotifications(userId);
          }
        } catch (error) {
          set({ notifications: previousNotifications });
          throw error;
        }
      },
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'tagus-notification-storage',
    }
  )
);
