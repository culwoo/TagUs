import { create } from 'zustand';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthStore {
  status: AuthStatus;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  status: 'loading',
  user: null,
  setUser: (user) => set({ user, status: user ? 'signedIn' : 'signedOut' }),
  setStatus: (status) => set({ status }),
  reset: () => set({ status: 'signedOut', user: null }),
}));
