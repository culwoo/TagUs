import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './config';

export interface ChatThread {
  id: string;
  itemId: number | null;
  title: string;
  preview: string;
  status: 'ready' | 'waiting' | 'closed';
  updatedAt: number;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'finder';
  text: string;
  createdAt: number;
}

export const chatService = {
  async getThreads(userId: string): Promise<ChatThread[]> {
    const ref = collection(db, `users/${userId}/chatThreads`);
    const snapshot = await getDocs(ref);
    return snapshot.docs
      .map(docSnapshot => docSnapshot.data() as ChatThread)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async saveThread(userId: string, thread: ChatThread): Promise<void> {
    const ref = doc(db, `users/${userId}/chatThreads`, thread.id);
    await setDoc(ref, thread, { merge: true });
  },

  async saveMessage(userId: string, threadId: string, message: ChatMessage): Promise<void> {
    const ref = doc(db, `users/${userId}/chatThreads/${threadId}/messages`, message.id);
    await setDoc(ref, message, { merge: true });
  },
};
