import { create } from 'zustand';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import type { User, UserSettings, StreakData } from '@/types';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateStreak: (streak: Partial<StreakData>) => Promise<void>;
  initialize: () => () => void;
}

const defaultSettings: UserSettings = {
  dailyReminderTime: '09:00',
  weekStartsOn: 'monday',
  theme: 'dark',
};

const defaultStreak: StreakData = {
  current: 0,
  longest: 0,
  lastCompletedDate: '',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            set({
              user: { id: firebaseUser.uid, ...userDoc.data() } as User,
              firebaseUser,
              loading: false,
              error: null,
            });
          } else {
            // Create new user document
            const newUser: Omit<User, 'id'> = {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              createdAt: serverTimestamp() as any,
              settings: defaultSettings,
              streak: defaultStreak,
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

            set({
              user: { id: firebaseUser.uid, ...newUser } as User,
              firebaseUser,
              loading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          set({ loading: false, error: 'Failed to load user data' });
        }
      } else {
        set({ user: null, firebaseUser: null, loading: false, error: null });
      }
    });

    return unsubscribe;
  },

  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ error: error.message, loading: false });
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, firebaseUser: null });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error.message });
    }
  },

  updateUserSettings: async (settings) => {
    const { user, firebaseUser } = get();
    if (!user || !firebaseUser) return;

    try {
      const updatedSettings = { ...user.settings, ...settings };
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        { settings: updatedSettings },
        { merge: true }
      );
      set({ user: { ...user, settings: updatedSettings } });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      set({ error: error.message });
    }
  },

  updateStreak: async (streak) => {
    const { user, firebaseUser } = get();
    if (!user || !firebaseUser) return;

    try {
      const updatedStreak = { ...user.streak, ...streak };
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        { streak: updatedStreak },
        { merge: true }
      );
      set({ user: { ...user, streak: updatedStreak } });
    } catch (error: any) {
      console.error('Error updating streak:', error);
      set({ error: error.message });
    }
  },
}));
