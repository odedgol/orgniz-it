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
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Task } from '@/types';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  subscribe: (userId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'order'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  reorderTasks: (tasks: Task[]) => Promise<void>;
  cleanup: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: true,
  error: null,
  unsubscribe: null,

  subscribe: (userId: string) => {
    const { unsubscribe: existingUnsubscribe } = get();
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        set({ tasks, loading: false, error: null });
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe });
  },

  addTask: async (taskData) => {
    const { tasks } = get();
    const sameDateTasks = tasks.filter((t) => t.date === taskData.date);
    const maxOrder = sameDateTasks.reduce((max, t) => Math.max(max, t.order), -1);

    try {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        completed: false,
        order: maxOrder + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error adding task:', error);
      set({ error: error.message });
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      set({ error: error.message });
    }
  },

  toggleTask: async (taskId) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        completed: !task.completed,
        completedAt: !task.completed ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error toggling task:', error);
      set({ error: error.message });
    }
  },

  deleteTask: async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error: any) {
      console.error('Error deleting task:', error);
      set({ error: error.message });
    }
  },

  reorderTasks: async (reorderedTasks) => {
    try {
      const batch = writeBatch(db);
      reorderedTasks.forEach((task, index) => {
        batch.update(doc(db, 'tasks', task.id), {
          order: index,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
    } catch (error: any) {
      console.error('Error reordering tasks:', error);
      set({ error: error.message });
    }
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null, tasks: [], loading: true });
    }
  },
}));
