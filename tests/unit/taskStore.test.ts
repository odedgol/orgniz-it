import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/types';
import { Timestamp, writeBatch } from 'firebase/firestore';

// Mock Firebase Firestore
const mockBatchUpdate = jest.fn();
const mockBatchCommit = jest.fn().mockResolvedValue(undefined);

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn((db, collection, id) => ({ id, collection })),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
  writeBatch: jest.fn(() => ({
    update: mockBatchUpdate,
    commit: mockBatchCommit,
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
    // Reset mocks
    mockBatchUpdate.mockClear();
    mockBatchCommit.mockClear();
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
        originalDate: '2025-12-03',
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
        originalDate: '2025-12-03',
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
        originalDate: '2025-12-04',
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
        originalDate: '2025-12-03',
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
        originalDate: '2025-12-03',
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

// Sticky Tasks Tests
describe('taskStore - sticky tasks behavior', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      loading: false,
      error: null,
      unsubscribe: null,
    });
    mockBatchUpdate.mockClear();
    mockBatchCommit.mockClear();
  });

  it('should identify overdue incomplete tasks', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const mockTasks: Task[] = [
      {
        id: '1',
        userId: 'user1',
        subjectId: 'subject1',
        title: 'Incomplete Task from Yesterday',
        date: yesterdayStr,
        originalDate: yesterdayStr,
        completed: false,
        order: 0,
        startTime: '09:00',
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
      {
        id: '2',
        userId: 'user1',
        subjectId: 'subject1',
        title: 'Completed Task from Yesterday',
        date: yesterdayStr,
        originalDate: yesterdayStr,
        completed: true,
        order: 1,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
    ];

    useTaskStore.setState({ tasks: mockTasks, loading: false });

    const state = useTaskStore.getState();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const overdueTasks = state.tasks.filter(
      (task) => !task.completed && task.date < todayStr
    );

    expect(overdueTasks).toHaveLength(1);
    expect(overdueTasks[0].title).toBe('Incomplete Task from Yesterday');
  });

  it('should preserve originalDate when task date moves', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const mockTask: Task = {
      id: '1',
      userId: 'user1',
      subjectId: 'subject1',
      title: 'Sticky Task',
      date: todayStr, // Task has moved to today
      originalDate: twoDaysAgoStr, // But originalDate stays the same
      completed: false,
      order: 0,
      createdAt: createMockTimestamp(),
      updatedAt: createMockTimestamp(),
    };

    useTaskStore.setState({ tasks: [mockTask], loading: false });

    const state = useTaskStore.getState();
    const task = state.tasks[0];

    // Task shows on today
    expect(task.date).toBe(todayStr);
    // But originalDate is preserved for stats
    expect(task.originalDate).toBe(twoDaysAgoStr);
    // They are different
    expect(task.date).not.toBe(task.originalDate);
  });

  it('should not update completed tasks', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const mockTasks: Task[] = [
      {
        id: '1',
        userId: 'user1',
        subjectId: 'subject1',
        title: 'Completed Task',
        date: yesterdayStr,
        originalDate: yesterdayStr,
        completed: true, // This is completed, should not move
        order: 0,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
    ];

    useTaskStore.setState({ tasks: mockTasks, loading: false });

    const state = useTaskStore.getState();
    const overdueTasks = state.tasks.filter(
      (task) => !task.completed && task.date < todayStr
    );

    // No overdue tasks because the only task is completed
    expect(overdueTasks).toHaveLength(0);
  });

  it('should call updateOverdueTasks and batch update', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const mockTasks: Task[] = [
      {
        id: 'overdue-1',
        userId: 'user1',
        subjectId: 'subject1',
        title: 'Overdue Task',
        date: yesterdayStr,
        originalDate: yesterdayStr,
        completed: false,
        order: 0,
        startTime: '09:00',
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
    ];

    useTaskStore.setState({ tasks: mockTasks, loading: false });

    await useTaskStore.getState().updateOverdueTasks();

    // Verify batch update was called
    expect(mockBatchUpdate).toHaveBeenCalled();
    expect(mockBatchCommit).toHaveBeenCalled();
  });

  it('should not call batch update when no overdue tasks', async () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const mockTasks: Task[] = [
      {
        id: '1',
        userId: 'user1',
        subjectId: 'subject1',
        title: 'Today Task',
        date: todayStr,
        originalDate: todayStr,
        completed: false,
        order: 0,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
    ];

    useTaskStore.setState({ tasks: mockTasks, loading: false });

    await useTaskStore.getState().updateOverdueTasks();

    // No batch update should be called
    expect(mockBatchUpdate).not.toHaveBeenCalled();
    expect(mockBatchCommit).not.toHaveBeenCalled();
  });
});
