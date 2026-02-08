import { doc, setDoc, collection, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import { createDefaultItemLocation, normalizeItem, type Item } from '../../shared/domain';

export interface FirestoreItem extends Item {
  userId: string;
  createdAt: number;
  updatedAt: number;
  storagePath?: string;
}

export const itemService = {
  // Get all items for a user
  async getItems(userId: string): Promise<Item[]> {
    const itemsRef = collection(db, `users/${userId}/items`);
    const snapshot = await getDocs(itemsRef);

    return snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data() as FirestoreItem;
      return normalizeItem({
        id: data.id ?? Number(docSnapshot.id),
        name: data.name,
        image: data.image,
        storagePath: data.storagePath,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        location: data.location ?? createDefaultItemLocation(data.updatedAt),
      });
    });
  },

  // Add item
  async addItem(userId: string, item: Item & { storagePath?: string }): Promise<void> {
    const itemRef = doc(db, `users/${userId}/items`, String(item.id));
    const createdAt = Date.now();
    const newItem: FirestoreItem = {
      ...item,
      userId,
      createdAt,
      updatedAt: createdAt,
    };

    await setDoc(itemRef, newItem);
  },

  // Update item
  async updateItem(userId: string, itemId: number, updates: Partial<Item>): Promise<void> {
    const itemRef = doc(db, `users/${userId}/items`, String(itemId));
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  // Delete item
  async deleteItem(userId: string, itemId: number, storagePath?: string): Promise<void> {
    const itemRef = doc(db, `users/${userId}/items`, String(itemId));
    await deleteDoc(itemRef);

    if (storagePath) {
      await itemService.deleteImage(storagePath);
    }
  },

  // Upload image
  async uploadImage(userId: string, file: File): Promise<{ downloadUrl: string; storagePath: string }> {
    const fileName = `${Date.now()}-${file.name}`;
    const storagePath = `items/${userId}/${fileName}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return { downloadUrl, storagePath };
  },

  // Delete image
  async deleteImage(storagePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  },
};
