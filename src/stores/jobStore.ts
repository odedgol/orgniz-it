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
import type { Job, JobStatus } from '@/types';

interface JobState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  subscribe: (userId: string) => void;
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJob: (jobId: string, updates: Partial<Job>) => Promise<void>;
  updateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  cleanup: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  loading: true,
  error: null,
  unsubscribe: null,

  subscribe: (userId: string) => {
    const { unsubscribe: existingUnsubscribe } = get();
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    const q = query(
      collection(db, 'jobs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const jobs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Job[];
        set({ jobs, loading: false, error: null });
      },
      (error) => {
        console.error('Error fetching jobs:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe });
  },

  addJob: async (jobData) => {
    try {
      await addDoc(collection(db, 'jobs'), {
        ...jobData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error adding job:', error);
      set({ error: error.message });
    }
  },

  updateJob: async (jobId, updates) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error updating job:', error);
      set({ error: error.message });
    }
  },

  updateJobStatus: async (jobId, status) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error updating job status:', error);
      set({ error: error.message });
    }
  },

  deleteJob: async (jobId) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
    } catch (error: any) {
      console.error('Error deleting job:', error);
      set({ error: error.message });
    }
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null, jobs: [], loading: true });
    }
  },
}));
