import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

declare global {
  interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY?: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
    readonly VITE_FIREBASE_PROJECT_ID?: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
    readonly VITE_FIREBASE_APP_ID?: string;
  }
}

const isTestMode = import.meta.env.MODE === 'test';
const pickEnv = (value: string | undefined, fallback: string) =>
  value && value.trim().length > 0 ? value : fallback;

const firebaseConfig = {
  apiKey: pickEnv(import.meta.env.VITE_FIREBASE_API_KEY, isTestMode ? 'test-api-key' : ''),
  authDomain: pickEnv(
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    isTestMode ? 'test-project.firebaseapp.com' : ''
  ),
  projectId: pickEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, isTestMode ? 'test-project' : ''),
  storageBucket: pickEnv(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    isTestMode ? 'test-project.appspot.com' : ''
  ),
  messagingSenderId: pickEnv(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    isTestMode ? '000000000000' : ''
  ),
  appId: pickEnv(
    import.meta.env.VITE_FIREBASE_APP_ID,
    isTestMode ? '1:000000000000:web:testappid0000000000' : ''
  ),
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Export app
export default app;
