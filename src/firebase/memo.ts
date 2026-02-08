import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';

export interface FirestoreMemo {
  userId: string;
  content: string;
  updatedAt: number;
}

export const memoService = {
  // Get memo
  async getMemo(userId: string): Promise<{ content: string; exists: boolean }> {
    const memoRef = doc(db, `users/${userId}/memo`, 'current');
    const snapshot = await getDoc(memoRef);

    if (snapshot.exists()) {
      return { content: snapshot.data().content as string, exists: true };
    }

    return { content: '', exists: false };
  },

  // Save memo
  async saveMemo(userId: string, content: string): Promise<void> {
    const memoRef = doc(db, `users/${userId}/memo`, 'current');
    const memo: FirestoreMemo = {
      userId,
      content,
      updatedAt: Date.now(),
    };

    await setDoc(memoRef, memo);
  },
};
