import { useJobStore } from '@/stores/jobStore';
import type { Job, JobStatus } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  addDoc: jest.fn().mockResolvedValue({ id: 'new-job-id' }),
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

describe('jobStore', () => {
  beforeEach(() => {
    // Reset store state
    useJobStore.setState({
      jobs: [],
      loading: true,
      error: null,
      unsubscribe: null,
    });
  });

  it('should have initial state', () => {
    const state = useJobStore.getState();
    expect(state.jobs).toEqual([]);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set jobs correctly', () => {
    const mockJobs: Job[] = [
      {
        id: '1',
        userId: 'user1',
        company: 'Acme Inc',
        title: 'Senior Developer',
        status: 'applied' as JobStatus,
        location: 'Remote',
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
    ];

    useJobStore.setState({ jobs: mockJobs, loading: false });

    const state = useJobStore.getState();
    expect(state.jobs).toHaveLength(1);
    expect(state.jobs[0].company).toBe('Acme Inc');
    expect(state.jobs[0].title).toBe('Senior Developer');
    expect(state.loading).toBe(false);
  });

  it('should set error correctly', () => {
    useJobStore.setState({ error: 'Failed to load jobs' });
    const state = useJobStore.getState();
    expect(state.error).toBe('Failed to load jobs');
  });

  it('should cleanup subscriptions', () => {
    const mockUnsubscribe = jest.fn();
    useJobStore.setState({ unsubscribe: mockUnsubscribe });

    useJobStore.getState().cleanup();

    expect(mockUnsubscribe).toHaveBeenCalled();
    const state = useJobStore.getState();
    expect(state.unsubscribe).toBeNull();
    expect(state.jobs).toEqual([]);
    expect(state.loading).toBe(true);
  });

  it('should filter jobs by status', () => {
    const mockJobs: Job[] = [
      {
        id: '1',
        userId: 'user1',
        company: 'Company A',
        title: 'Developer',
        status: 'applied' as JobStatus,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
      {
        id: '2',
        userId: 'user1',
        company: 'Company B',
        title: 'Engineer',
        status: 'interview' as JobStatus,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
      {
        id: '3',
        userId: 'user1',
        company: 'Company C',
        title: 'Manager',
        status: 'offer' as JobStatus,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
    ];

    useJobStore.setState({ jobs: mockJobs, loading: false });

    const state = useJobStore.getState();
    const appliedJobs = state.jobs.filter((j) => j.status === 'applied');
    const interviewJobs = state.jobs.filter((j) => j.status === 'interview');
    const offerJobs = state.jobs.filter((j) => j.status === 'offer');

    expect(appliedJobs).toHaveLength(1);
    expect(interviewJobs).toHaveLength(1);
    expect(offerJobs).toHaveLength(1);
  });

  it('should handle all job statuses', () => {
    const statuses: JobStatus[] = ['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected'];
    const mockJobs: Job[] = statuses.map((status, index) => ({
      id: `${index}`,
      userId: 'user1',
      company: `Company ${index}`,
      title: 'Developer',
      status,
      createdAt: createMockTimestamp(),
      updatedAt: createMockTimestamp(),
    }));

    useJobStore.setState({ jobs: mockJobs, loading: false });

    const state = useJobStore.getState();
    expect(state.jobs).toHaveLength(6);

    // Check each status exists
    statuses.forEach((status) => {
      const jobsWithStatus = state.jobs.filter((j) => j.status === status);
      expect(jobsWithStatus).toHaveLength(1);
    });
  });

  it('should handle jobs with salary range', () => {
    const mockJobs: Job[] = [
      {
        id: '1',
        userId: 'user1',
        company: 'High Paying Corp',
        title: 'Staff Engineer',
        status: 'interview' as JobStatus,
        salaryMin: 150000,
        salaryMax: 200000,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
      {
        id: '2',
        userId: 'user1',
        company: 'Startup',
        title: 'Developer',
        status: 'applied' as JobStatus,
        salaryMin: 80000,
        salaryMax: 100000,
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
    ];

    useJobStore.setState({ jobs: mockJobs, loading: false });

    const state = useJobStore.getState();
    const highPayingJobs = state.jobs.filter((j) => j.salaryMin && j.salaryMin >= 100000);
    expect(highPayingJobs).toHaveLength(1);
    expect(highPayingJobs[0].company).toBe('High Paying Corp');
  });

  it('should handle jobs with contacts', () => {
    const mockJobs: Job[] = [
      {
        id: '1',
        userId: 'user1',
        company: 'Acme Inc',
        title: 'Developer',
        status: 'interview' as JobStatus,
        contact: {
          name: 'Jane Doe',
          email: 'jane@acme.com',
          phone: '555-1234',
        },
        createdAt: createMockTimestamp(),
        updatedAt: createMockTimestamp(),
      },
    ];

    useJobStore.setState({ jobs: mockJobs, loading: false });

    const state = useJobStore.getState();
    expect(state.jobs[0].contact?.name).toBe('Jane Doe');
    expect(state.jobs[0].contact?.email).toBe('jane@acme.com');
  });
});
