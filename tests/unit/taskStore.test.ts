import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
  writeBatch: jest.fn(() => ({
    update: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  })),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    fromDate: jest.fn((date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
  },
}));

// Helper to create mock Timestamp
const createMockTimestamp = (): Timestamp => ({
  seconds: Date.now() / 1000,
  nanoseconds: 0,
  toDate: () => new Date(),
  toMillis: () => Date.now(),
  isEqual: () => false,
  valueOf: () => '',
}) as unknown as Timestamp;

describe('taskStore', () => {
  beforeEach(() => {
    // Reset store state
    useTaskStore.setState({
      tasks: [],
      loading: true,
      error: null,
      unsubscribe: null,
    });
  });

  it('should have initial state', () => {
    const state = useTaskStore.getState();
    expect(state.tasks).toEqual([]);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set tasks correctly', () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        userId: 'user1',
        subjectId: 'subject1',
        title: 'Test Task',
        date: '2025-12-03',
        completed: false,
        order: 0,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
    ];

    useTaskStore.setState({ tasks: mockTasks, loading: false });

    const state = useTaskStore.getState();
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].title).toBe('Test Task');
    expect(state.loading).toBe(false);
  });

  it('should set error correctly', () => {
    useTaskStore.setState({ error: 'Something went wrong' });
    const state = useTaskStore.getState();
    expect(state.error).toBe('Something went wrong');
  });

  it('should cleanup subscriptions', () => {
    const mockUnsubscribe = jest.fn();
    useTaskStore.setState({ unsubscribe: mockUnsubscribe });

    useTaskStore.getState().cleanup();

    expect(mockUnsubscribe).toHaveBeenCalled();
    const state = useTaskStore.getState();
    expect(state.unsubscribe).toBeNull();
    expect(state.tasks).toEqual([]);
    expect(state.loading).toBe(true);
  });

  it('should filter tasks by date', () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        userId: 'user1',
        subjectId: 'subject1',
        title: 'Task 1',
        date: '2025-12-03',
        completed: false,
        order: 0,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
      {
        id: '2',
        userId: 'user1',
        subjectId: 'subject1',
        title: 'Task 2',
        date: '2025-12-04',
        completed: false,
        order: 0,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
    ];

    useTaskStore.setState({ tasks: mockTasks, loading: false });

    const state = useTaskStore.getState();
    const filteredTasks = state.tasks.filter((t) => t.date === '2025-12-03');
    expect(filteredTasks).toHaveLength(1);
    expect(filteredTasks[0].title).toBe('Task 1');
  });

  it('should handle multiple tasks with different subjects', () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        userId: 'user1',
        subjectId: 'subject1',
        title: 'Coding Task',
        date: '2025-12-03',
        completed: false,
        order: 0,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
      {
        id: '2',
        userId: 'user1',
        subjectId: 'subject2',
        title: 'Design Task',
        date: '2025-12-03',
        completed: true,
        order: 1,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
    ];

    useTaskStore.setState({ tasks: mockTasks, loading: false });

    const state = useTaskStore.getState();
    const subject1Tasks = state.tasks.filter((t) => t.subjectId === 'subject1');
    const subject2Tasks = state.tasks.filter((t) => t.subjectId === 'subject2');

    expect(subject1Tasks).toHaveLength(1);
    expect(subject2Tasks).toHaveLength(1);
    expect(subject1Tasks[0].completed).toBe(false);
    expect(subject2Tasks[0].completed).toBe(true);
  });
});
