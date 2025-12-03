import { useTaskStore } from '@/stores/taskStore';

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
  serverTimestamp: jest.fn(() => new Date()),
  writeBatch: jest.fn(() => ({
    update: jest.fn(),
    commit: jest.fn(),
  })),
}));

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
    const mockTasks = [
      {
        id: '1',
        userId: 'user1',
        subjectId: 'subject1',
        title: 'Test Task',
        date: '2025-12-03',
        completed: false,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    useTaskStore.setState({ tasks: mockTasks, loading: false });

    const state = useTaskStore.getState();
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].title).toBe('Test Task');
    expect(state.loading).toBe(false);
  });

  it('should cleanup subscriptions', () => {
    const mockUnsubscribe = jest.fn();
    useTaskStore.setState({ unsubscribe: mockUnsubscribe });

    useTaskStore.getState().cleanup();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
