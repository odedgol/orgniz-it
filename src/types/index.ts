import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  settings: UserSettings;
  streak: StreakData;
}

export interface UserSettings {
  dailyReminderTime: string; // "09:00"
  weekStartsOn: 'sunday' | 'monday';
  theme: 'dark' | 'light' | 'system';
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  firstReminderHours: number; // Hours before interview (default: 24)
  secondReminderHours: number; // Hours before interview (default: 1)
}

export interface StreakData {
  current: number;
  longest: number;
  lastCompletedDate: string; // "2025-12-03"
}

// Subject Types
export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string; // Hex color
  weeklyGoalTasks: number;
  topics: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Task Types
export interface Task {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  date: string; // "2025-12-03"
  completed: boolean;
  completedAt?: Timestamp;
  order: number; // For drag-to-reorder
  startTime?: string; // "09:00" - optional for day view scheduling
  endTime?: string; // "10:30" - optional for day view scheduling
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Job Types
export type JobStatus = 'wishlist' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

export interface JobContact {
  name: string;
  email?: string;
  phone?: string;
}

export interface Job {
  id: string;
  userId: string;
  company: string;
  title: string;
  url?: string;
  status: JobStatus;
  appliedDate?: Timestamp;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  contact?: JobContact;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Interview Types
export type InterviewType = 'phone' | 'technical' | 'behavioral' | 'onsite' | 'final' | 'other';

export interface Interview {
  id: string;
  jobId: string;
  userId: string;
  date: Timestamp;
  time: string; // "14:00"
  type: InterviewType;
  interviewer?: string;
  notes?: string;
  reminderSent: {
    dayBefore: boolean;
    hourBefore: boolean;
  };
  createdAt: Timestamp;
}

// UI Types
export type ViewType = 'day' | 'week' | 'month';

export interface StatsData {
  streakDays: number;
  tasksCompleted: number;
  totalTasks: number;
  activeApplications: number;
  responseRate: number;
}

// Subject Color Presets
export const SUBJECT_COLORS = [
  { name: 'Blue', value: '#5E6AD2' },
  { name: 'Green', value: '#3DCC79' },
  { name: 'Cyan', value: '#22D3EE' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Purple', value: '#9F7AEA' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Yellow', value: '#EAB308' },
] as const;

// Job Status Colors
export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  wishlist: '#A1A1A6',
  applied: '#5E6AD2',
  screening: '#22D3EE',
  interview: '#F59E0B',
  offer: '#3DCC79',
  rejected: '#EF4444',
};

// Interview Type Labels
export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  phone: 'Phone Screen',
  technical: 'Technical',
  behavioral: 'Behavioral',
  onsite: 'Onsite',
  final: 'Final Round',
  other: 'Other',
};
