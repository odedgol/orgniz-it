export interface Subject {
  id: string;
  name: string;
  color: string;
  weeklyGoalTasks: number;
  topics: string[];
}

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  date: string; // ISO Date string YYYY-MM-DD
  completed: boolean;
  order: number;
}

export type JobStatus = 'wishlist' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

export interface Job {
  id: string;
  company: string;
  title: string;
  status: JobStatus;
  location: string;
  salary?: string;
  appliedDate: string;
  url?: string;
  notes?: string;
}

export interface Interview {
  id: string;
  jobId: string;
  date: string; // ISO string
  time: string; // HH:mm
  type: 'phone' | 'technical' | 'behavioral' | 'onsite' | 'final';
  notes?: string;
}

export interface UserSettings {
  name: string;
  streak: number;
  lastCompletedDate: string;
}

export interface StoreState {
  tasks: Task[];
  subjects: Subject[];
  jobs: Job[];
  interviews: Interview[];
  user: UserSettings;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'order'>) => void;
  toggleTask: (id: string) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  addJob: (job: Omit<Job, 'id'>) => void;
  updateJob: (job: Job) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
}