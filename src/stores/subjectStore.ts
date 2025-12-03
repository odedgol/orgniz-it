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
import type { Subject } from '@/types';

interface SubjectState {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  subscribe: (userId: string) => void;
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubject: (subjectId: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  cleanup: () => void;
}

export const useSubjectStore = create<SubjectState>((set, get) => ({
  subjects: [],
  loading: true,
  error: null,
  unsubscribe: null,

  subscribe: (userId: string) => {
    const { unsubscribe: existingUnsubscribe } = get();
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    const q = query(
      collection(db, 'subjects'),
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const subjects = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Subject[];
        set({ subjects, loading: false, error: null });
      },
      (error) => {
        console.error('Error fetching subjects:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe });
  },

  addSubject: async (subjectData) => {
    try {
      await addDoc(collection(db, 'subjects'), {
        ...subjectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error adding subject:', error);
      set({ error: error.message });
    }
  },

  updateSubject: async (subjectId, updates) => {
    try {
      await updateDoc(doc(db, 'subjects', subjectId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error updating subject:', error);
      set({ error: error.message });
    }
  },

  deleteSubject: async (subjectId) => {
    try {
      await deleteDoc(doc(db, 'subjects', subjectId));
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      set({ error: error.message });
    }
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null, subjects: [], loading: true });
    }
  },
}));
