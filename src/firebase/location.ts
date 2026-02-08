import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';

export interface FirestoreLocation {
  userId: string;
  name: string;
  station: string;
  boxNumber: string;
  updatedAt: number;
}

export const locationService = {
  // Get location
  async getLocation(userId: string): Promise<{ location: FirestoreLocation; exists: boolean }> {
    const locationRef = doc(db, `users/${userId}/location`, 'current');
    const snapshot = await getDoc(locationRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as FirestoreLocation;
      return { location: data, exists: true };
    }

    return {
      location: {
        userId,
        name: '현재위치',
        station: '서울역 4호선',
        boxNumber: '분실물 보관함 230번',
        updatedAt: Date.now(),
      },
      exists: false,
    };
  },

  // Update location
  async updateLocation(
    userId: string,
    location: { name: string; station: string; boxNumber: string }
  ): Promise<void> {
    const locationRef = doc(db, `users/${userId}/location`, 'current');
    const firestoreLocation: FirestoreLocation = {
      userId,
      ...location,
      updatedAt: Date.now(),
    };

    await setDoc(locationRef, firestoreLocation);
  },
};
