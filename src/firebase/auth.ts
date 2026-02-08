import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from './config';
import type { AuthUser } from '../stores/authStore';

const mapUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});

export const authService = {
  subscribe: (callback: (user: AuthUser | null) => void) =>
    onAuthStateChanged(auth, user => callback(user ? mapUser(user) : null)),
  signInWithGoogle: () => signInWithPopup(auth, googleProvider),
  signOut: () => signOut(auth),
};
