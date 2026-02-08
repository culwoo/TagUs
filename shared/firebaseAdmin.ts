import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';

const getPrivateKey = () => {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) {
    return undefined;
  }
  return raw.replace(/\\n/g, '\n');
};

const getFirebaseAdminApp = (): App => {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  throw new Error(
    'Firebase Admin credentials are missing. Set FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.'
  );
};

export const verifyFirebaseIdToken = async (
  authorizationHeader?: string
): Promise<DecodedIdToken> => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw new Error('Missing Bearer token');
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new Error('Invalid Bearer token');
  }

  const app = getFirebaseAdminApp();
  return getAuth(app).verifyIdToken(token);
};
