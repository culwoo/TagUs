import { itemService } from './items';
import { memoService } from './memo';
import { locationService } from './location';
import { notificationService } from './notifications';
import { chatService } from './chat';
import { db } from './config';
import { useItemsStore } from '../stores/itemsStore';
import { useMemoStore } from '../stores/memoStore';
import { useLocationStore } from '../stores/locationStore';
import { useActivityStore } from '../stores/activityStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useChatStore } from '../stores/chatStore';
import { normalizeItem, type Item } from '../../shared/domain';
import { collection, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';

const SCHEMA_VERSION = 2;

const getSchemaVersion = async (userId: string) => {
  const schemaRef = doc(db, `users/${userId}/meta`, 'schema');
  const schemaSnapshot = await getDoc(schemaRef);
  const version = Number(schemaSnapshot.data()?.version ?? 1);
  return { schemaRef, version };
};

const migrateUserSchemaV2 = async (userId: string) => {
  const { schemaRef, version } = await getSchemaVersion(userId);
  if (version >= SCHEMA_VERSION) {
    return;
  }

  const legacyLocationResult = await locationService.getLocation(userId);
  const fallbackLocation = {
    label: legacyLocationResult.location.name || '미지정',
    station: legacyLocationResult.location.station || '',
    boxNumber: legacyLocationResult.location.boxNumber || '',
    updatedAt: legacyLocationResult.location.updatedAt || Date.now(),
  };

  const itemsRef = collection(db, `users/${userId}/items`);
  const snapshot = await getDocs(itemsRef);
  const batch = writeBatch(db);
  let hasUpdates = false;

  snapshot.docs.forEach((itemDoc) => {
    const data = itemDoc.data() as Partial<Item>;
    const needsMigration = !data.location || !data.status || !data.createdAt || !data.updatedAt;
    if (!needsMigration) {
      return;
    }

    const normalized = normalizeItem(
      {
        id: Number(data.id ?? itemDoc.id),
        name: data.name ?? '이름 없음',
        image: data.image ?? '',
        storagePath: data.storagePath,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: Date.now(),
        location: data.location,
      },
      fallbackLocation
    );

    batch.set(itemDoc.ref, normalized, { merge: true });
    hasUpdates = true;
  });

  if (hasUpdates) {
    await batch.commit();
  }

  await setDoc(
    schemaRef,
    {
      version: SCHEMA_VERSION,
      migratedAt: Date.now(),
    },
    { merge: true }
  );
};

export const hydrateUserData = async (userId: string) => {
  const itemsStore = useItemsStore.getState();
  const memoStore = useMemoStore.getState();
  const locationStore = useLocationStore.getState();

  await migrateUserSchemaV2(userId);

  const [remoteItems, remoteMemo, remoteLocation, remoteNotifications, remoteThreads] = await Promise.all([
    itemService.getItems(userId),
    memoService.getMemo(userId),
    locationService.getLocation(userId),
    notificationService.getNotifications(userId),
    chatService.getThreads(userId),
  ]);

  if (remoteItems.length > 0) {
    useItemsStore.getState().setItems(remoteItems);
  } else if (itemsStore.items.length > 0) {
    const fallbackLocation = {
      label: remoteLocation.location.name,
      station: remoteLocation.location.station,
      boxNumber: remoteLocation.location.boxNumber,
      updatedAt: remoteLocation.location.updatedAt,
    };

    const normalizedLocalItems = itemsStore.items.map((item) => normalizeItem(item, fallbackLocation));
    await Promise.all(normalizedLocalItems.map((item) => itemService.addItem(userId, item)));
    useItemsStore.getState().setItems(normalizedLocalItems);
  }

  if (remoteMemo.exists) {
    useMemoStore.getState().setMemo(remoteMemo.content);
  } else if (memoStore.memo.trim()) {
    await memoService.saveMemo(userId, memoStore.memo);
  }

  if (remoteLocation.exists) {
    useLocationStore.getState().setLocation(remoteLocation.location);
  } else {
    await locationService.updateLocation(userId, locationStore.location);
  }

  useNotificationStore.getState().setNotifications(remoteNotifications);
  useChatStore.getState().setThreads(remoteThreads);
  await useChatStore.getState().ensureDefaultThread();
  void useNotificationStore
    .getState()
    .addNotification('동기화 완료', '클라우드 데이터 동기화가 완료되었습니다.', 'success')
    .catch((error) => console.error('Failed to add sync notification:', error));

  useActivityStore.getState().addActivity('auth.signin', '클라우드 동기화 완료');
};

export const clearLocalData = () => {
  useItemsStore.getState().setItems([]);
  useMemoStore.getState().setMemo('');
  useLocationStore.getState().setLocation({
    name: '현재위치',
    station: '서울역 4호선',
    boxNumber: '분실물 보관함 230번',
  });
  useActivityStore.getState().clearActivities();
  useNotificationStore.getState().clearNotifications();
  useChatStore.getState().clearThreads();

  useItemsStore.persist.clearStorage();
  useMemoStore.persist.clearStorage();
  useLocationStore.persist.clearStorage();
  useActivityStore.persist.clearStorage();
  useNotificationStore.persist.clearStorage();
  useChatStore.persist.clearStorage();
};
