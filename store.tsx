import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Subject, Job, Interview, UserSettings, StoreState, JobStatus } from './types';
import { format, subDays, addDays } from 'date-fns';

const StoreContext = createContext<StoreState | undefined>(undefined);

// Mock Data Generation
const TODAY = new Date();
const formatDate = (d: Date) => format(d, 'yyyy-MM-dd');

const initialSubjects: Subject[] = [
  { id: 's1', name: 'Algorithms', color: '#5E6AD2', weeklyGoalTasks: 8, topics: ['Binary Search', 'DP', 'Graphs'] },
  { id: 's2', name: 'System Design', color: '#3DCC79', weeklyGoalTasks: 6, topics: ['Scalability', 'Databases'] },
  { id: 's3', name: 'React', color: '#22D3EE', weeklyGoalTasks: 10, topics: ['Hooks', 'Performance', 'Testing'] },
  { id: 's4', name: 'Applications', color: '#F59E0B', weeklyGoalTasks: 10, topics: ['Resume', 'Networking'] },
];

const initialTasks: Task[] = [
  { id: 't1', subjectId: 's1', title: 'LeetCode - Binary Search', date: formatDate(TODAY), completed: true, order: 0 },
  { id: 't2', subjectId: 's4', title: 'Apply to Stripe', date: formatDate(TODAY), completed: true, order: 1 },
  { id: 't3', subjectId: 's2', title: 'DDIA Chapter 5', date: formatDate(TODAY), completed: false, order: 2 },
  { id: 't4', subjectId: 's3', title: 'React Custom Hooks', date: formatDate(TODAY), completed: false, order: 3 },
  { id: 't5', subjectId: 's3', title: 'Prepare for Vercel', date: formatDate(TODAY), completed: false, order: 4 },
  // Past tasks for stats
  { id: 't6', subjectId: 's1', title: 'Two Sum', date: formatDate(subDays(TODAY, 1)), completed: true, order: 0 },
  { id: 't7', subjectId: 's3', title: 'UseEffect Deep Dive', date: formatDate(subDays(TODAY, 1)), completed: true, order: 1 },
];

const initialJobs: Job[] = [
  { id: 'j1', company: 'Vercel', title: 'Senior Frontend Engineer', status: 'interview', location: 'Remote', salary: '$180k-220k', appliedDate: formatDate(subDays(TODAY, 5)) },
  { id: 'j2', company: 'Stripe', title: 'Frontend Engineer, Dashboard', status: 'applied', location: 'San Francisco', appliedDate: formatDate(TODAY) },
  { id: 'j3', company: 'Notion', title: 'Product Engineer', status: 'wishlist', location: 'New York', appliedDate: formatDate(subDays(TODAY, 2)) },
  { id: 'j4', company: 'Linear', title: 'Frontend Engineer', status: 'screening', location: 'Remote', appliedDate: formatDate(subDays(TODAY, 10)) },
  { id: 'j5', company: 'Airbnb', title: 'Software Engineer', status: 'rejected', location: 'San Francisco', appliedDate: formatDate(subDays(TODAY, 15)) },
];

const initialInterviews: Interview[] = [
  { id: 'i1', jobId: 'j1', date: formatDate(addDays(TODAY, 1)), time: '14:00', type: 'phone', notes: 'Prepare questions about Next.js roadmap' },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  const [user, setUser] = useState<UserSettings>({
    name: 'Alex',
    streak: 7,
    lastCompletedDate: formatDate(TODAY)
  });

  const addTask = (task: Omit<Task, 'id' | 'completed' | 'order'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      completed: false,
      order: tasks.length,
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subject,
      id: Math.random().toString(36).substr(2, 9),
    };
    setSubjects([...subjects, newSubject]);
  };

  const updateSubject = (updatedSubject: Subject) => {
    setSubjects(subjects.map(s => s.id === updatedSubject.id ? updatedSubject : s));
  };

  const addJob = (job: Omit<Job, 'id'>) => {
    const newJob: Job = {
      ...job,
      id: Math.random().toString(36).substr(2, 9),
    };
    setJobs([...jobs, newJob]);
  };

  const updateJob = (updatedJob: Job) => {
    setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const updateJobStatus = (id: string, status: JobStatus) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status } : j));
  };

  return (
    <StoreContext.Provider value={{ tasks, subjects, jobs, interviews, user, addTask, toggleTask, addSubject, updateSubject, addJob, updateJob, updateJobStatus }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};