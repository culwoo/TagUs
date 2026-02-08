import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './config';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: number;
}

export const notificationService = {
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const ref = collection(db, `users/${userId}/notifications`);
    const snapshot = await getDocs(ref);

    return snapshot.docs
      .map((docSnapshot) => docSnapshot.data() as AppNotification)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async saveNotification(userId: string, notification: AppNotification): Promise<void> {
    const ref = doc(db, `users/${userId}/notifications`, notification.id);
    await setDoc(ref, notification, { merge: true });
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const ref = doc(db, `users/${userId}/notifications`, notificationId);
    await updateDoc(ref, { isRead: true });
  },

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const ref = doc(db, `users/${userId}/notifications`, notificationId);
    await deleteDoc(ref);
  },

  async deleteAllNotifications(userId: string): Promise<void> {
    const ref = collection(db, `users/${userId}/notifications`);
    const snapshot = await getDocs(ref);

    if (snapshot.empty) {
      return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
    });

    await batch.commit();
  },
};
