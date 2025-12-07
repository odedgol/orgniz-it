import { useInterviewStore } from '@/stores/interviewStore';
import type { Interview, InterviewType } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  addDoc: jest.fn().mockResolvedValue({ id: 'new-interview-id' }),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  deleteDoc: jest.fn().mockResolvedValue(undefined),
  doc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    fromDate: jest.fn((date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
  },
}));

// Helper to create mock Timestamp
const createMockTimestamp = (): Timestamp =>
  ({
    seconds: Date.now() / 1000,
    nanoseconds: 0,
    toDate: () => new Date(),
    toMillis: () => Date.now(),
    isEqual: () => false,
    valueOf: () => '',
  }) as unknown as Timestamp;

describe('interviewStore', () => {
  beforeEach(() => {
    // Reset store state
    useInterviewStore.setState({
      interviews: [],
      loading: true,
      error: null,
      unsubscribe: null,
    });
  });

  it('should have initial state', () => {
    const state = useInterviewStore.getState();
    expect(state.interviews).toEqual([]);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set interviews correctly', () => {
    const mockInterviews: Interview[] = [
      {
        id: '1',
        jobId: 'job1',
        userId: 'user1',
        date: createMockTimestamp(),
        time: '14:00',
        type: 'technical' as InterviewType,
        interviewer: 'John Doe',
        notes: 'Prepare for coding questions',
        reminderSent: {
          dayBefore: false,
          hourBefore: false,
        },
        createdAt: createMockTimestamp(),
      },
    ];

    useInterviewStore.setState({ interviews: mockInterviews, loading: false });

    const state = useInterviewStore.getState();
    expect(state.interviews).toHaveLength(1);
    expect(state.interviews[0].type).toBe('technical');
    expect(state.interviews[0].interviewer).toBe('John Doe');
    expect(state.loading).toBe(false);
  });

  it('should set error correctly', () => {
    useInterviewStore.setState({ error: 'Failed to load interviews' });
    const state = useInterviewStore.getState();
    expect(state.error).toBe('Failed to load interviews');
  });

  it('should cleanup subscriptions', () => {
    const mockUnsubscribe = jest.fn();
    useInterviewStore.setState({ unsubscribe: mockUnsubscribe });

    useInterviewStore.getState().cleanup();

    expect(mockUnsubscribe).toHaveBeenCalled();
    const state = useInterviewStore.getState();
    expect(state.unsubscribe).toBeNull();
    expect(state.interviews).toEqual([]);
    expect(state.loading).toBe(true);
  });

  it('should filter interviews by job', () => {
    const mockInterviews: Interview[] = [
      {
        id: '1',
        jobId: 'job1',
        userId: 'user1',
        date: createMockTimestamp(),
        time: '10:00',
        type: 'phone' as InterviewType,
        reminderSent: { dayBefore: false, hourBefore: false },
        createdAt: createMockTimestamp(),
      },
      {
        id: '2',
        jobId: 'job2',
        userId: 'user1',
        date: createMockTimestamp(),
        time: '14:00',
        type: 'technical' as InterviewType,
        reminderSent: { dayBefore: false, hourBefore: false },
        createdAt: createMockTimestamp(),
      },
    ];

    useInterviewStore.setState({ interviews: mockInterviews, loading: false });

    const state = useInterviewStore.getState();
    const job1Interviews = state.interviews.filter((i) => i.jobId === 'job1');
    expect(job1Interviews).toHaveLength(1);
    expect(job1Interviews[0].type).toBe('phone');
  });

  it('should handle different interview types', () => {
    const interviewTypes: InterviewType[] = ['phone', 'technical', 'behavioral', 'onsite', 'final', 'other'];
    const mockInterviews: Interview[] = interviewTypes.map((type, index) => ({
      id: `${index}`,
      jobId: 'job1',
      userId: 'user1',
      date: createMockTimestamp(),
      time: '10:00',
      type,
      reminderSent: { dayBefore: false, hourBefore: false },
      createdAt: createMockTimestamp(),
    }));

    useInterviewStore.setState({ interviews: mockInterviews, loading: false });

    const state = useInterviewStore.getState();
    expect(state.interviews).toHaveLength(6);

    const technicalInterviews = state.interviews.filter((i) => i.type === 'technical');
    expect(technicalInterviews).toHaveLength(1);
  });

  it('should track reminder sent status', () => {
    const mockInterviews: Interview[] = [
      {
        id: '1',
        jobId: 'job1',
        userId: 'user1',
        date: createMockTimestamp(),
        time: '10:00',
        type: 'phone' as InterviewType,
        reminderSent: { dayBefore: true, hourBefore: false },
        createdAt: createMockTimestamp(),
      },
      {
        id: '2',
        jobId: 'job2',
        userId: 'user1',
        date: createMockTimestamp(),
        time: '14:00',
        type: 'technical' as InterviewType,
        reminderSent: { dayBefore: true, hourBefore: true },
        createdAt: createMockTimestamp(),
      },
    ];

    useInterviewStore.setState({ interviews: mockInterviews, loading: false });

    const state = useInterviewStore.getState();
    const notifiedBefore = state.interviews.filter((i) => i.reminderSent.dayBefore);
    const fullyNotified = state.interviews.filter((i) => i.reminderSent.dayBefore && i.reminderSent.hourBefore);

    expect(notifiedBefore).toHaveLength(2);
    expect(fullyNotified).toHaveLength(1);
  });
});
