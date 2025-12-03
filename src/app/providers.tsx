'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useTaskStore } from '@/src/stores/taskStore';
import { useSubjectStore } from '@/src/stores/subjectStore';
import { useJobStore } from '@/src/stores/jobStore';
import { useInterviewStore } from '@/src/stores/interviewStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const { initialize, user } = useAuthStore();
  const taskStore = useTaskStore();
  const subjectStore = useSubjectStore();
  const jobStore = useJobStore();
  const interviewStore = useInterviewStore();

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Subscribe to data stores when user is authenticated
  useEffect(() => {
    if (user?.id) {
      taskStore.subscribe(user.id);
      subjectStore.subscribe(user.id);
      jobStore.subscribe(user.id);
      interviewStore.subscribe(user.id);
    }

    return () => {
      taskStore.cleanup();
      subjectStore.cleanup();
      jobStore.cleanup();
      interviewStore.cleanup();
    };
  }, [user?.id]);

  return <>{children}</>;
}
