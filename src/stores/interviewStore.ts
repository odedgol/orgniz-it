import { create } from 'zustand';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Interview, InterviewType } from '@/types';

interface InterviewState {
  interviews: Interview[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  subscribe: (userId: string) => void;
  addInterview: (interview: Omit<Interview, 'id' | 'createdAt' | 'reminderSent'>) => Promise<void>;
  updateInterview: (interviewId: string, updates: Partial<Interview>) => Promise<void>;
  deleteInterview: (interviewId: string) => Promise<void>;
  cleanup: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  interviews: [],
  loading: true,
  error: null,
  unsubscribe: null,

  subscribe: (userId: string) => {
    const { unsubscribe: existingUnsubscribe } = get();
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    const q = query(
      collection(db, 'interviews'),
      where('userId', '==', userId),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const interviews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Interview[];
        set({ interviews, loading: false, error: null });
      },
      (error) => {
        console.error('Error fetching interviews:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe });
  },

  addInterview: async (interviewData) => {
    try {
      await addDoc(collection(db, 'interviews'), {
        ...interviewData,
        reminderSent: {
          firstReminder: false,
          secondReminder: false,
        },
        createdAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error adding interview:', error);
      set({ error: error.message });
    }
  },

  updateInterview: async (interviewId, updates) => {
    try {
      // If date or time is being changed, reset the reminder flags
      // so notifications can be sent for the new time
      const updatesToSave = { ...updates };
      if ('date' in updates || 'time' in updates) {
        updatesToSave.reminderSent = {
          firstReminder: false,
          secondReminder: false,
        };
      }
      await updateDoc(doc(db, 'interviews', interviewId), updatesToSave);
    } catch (error: any) {
      console.error('Error updating interview:', error);
      set({ error: error.message });
    }
  },

  deleteInterview: async (interviewId) => {
    try {
      await deleteDoc(doc(db, 'interviews', interviewId));
    } catch (error: any) {
      console.error('Error deleting interview:', error);
      set({ error: error.message });
    }
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null, interviews: [], loading: true });
    }
  },
}));
