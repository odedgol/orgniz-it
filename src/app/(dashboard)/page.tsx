'use client';

import React, { useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Flame, Briefcase, Calendar, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui';
import { TaskList } from '@/components/features/TaskList';
import { NotificationPermission } from '@/components/features/NotificationPermission';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { useSubjectStore } from '@/stores/subjectStore';
import { useJobStore } from '@/stores/jobStore';
import { useInterviewStore } from '@/stores/interviewStore';
import { useStreak } from '@/hooks/useStreak';
import { formatDate, getGreeting } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { tasks, addTask, toggleTask, deleteTask, updateOverdueTasks, loading } = useTaskStore();

  // Update overdue tasks to today when page loads
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      updateOverdueTasks();
    }
  }, [loading, updateOverdueTasks]);
  const { subjects } = useSubjectStore();
  const { jobs } = useJobStore();
  const { interviews } = useInterviewStore();
  const { currentStreak } = useStreak();

  const today = new Date();
  const todayStr = formatDate(today);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const todaysTasks = tasks
    .filter((t) => t.date === todayStr)
    .sort((a, b) => a.order - b.order);
  const completedToday = todaysTasks.filter((t) => t.completed).length;

  const activeApps = jobs.filter((j) =>
    ['applied', 'screening', 'interview'].includes(j.status)
  ).length;
  const interviewCount = jobs.filter((j) => j.status === 'interview').length;

  // Get upcoming interview
  const upcomingInterview = interviews
    .filter((i) => {
      const interviewDate = i.date?.toDate?.() || new Date(i.date as any);
      return interviewDate >= today;
    })
    .sort((a, b) => {
      const dateA = a.date?.toDate?.() || new Date(a.date as any);
      const dateB = b.date?.toDate?.() || new Date(b.date as any);
      return dateA.getTime() - dateB.getTime();
    })[0];

  const handleAddTask = async (title: string, subjectId: string) => {
    if (!title.trim() || !user) return;

    // Get current time for the task
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const startTime = `${currentHour}:${currentMinute}`;

    // End time is 1 hour after start
    const endHour = ((now.getHours() + 1) % 24).toString().padStart(2, '0');
    const endTime = `${endHour}:${currentMinute}`;

    await addTask({
      userId: user.id,
      title,
      subjectId,
      date: todayStr,
      startTime,
      endTime,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-1 md:mb-2">
            {getGreeting()}, {user?.displayName?.split(' ')[0]}!
          </h1>
          <p className="text-sm md:text-base text-text-secondary">
            {format(today, 'EEEE, MMMM d')} •{' '}
            <span className="text-accent-orange font-medium">
              {currentStreak} day streak
            </span>
          </p>
        </div>
      </div>

      {/* Notification Permission Banner */}
      <NotificationPermission variant="banner" />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="flex items-center gap-3 md:gap-4 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
          <div className="p-2 md:p-3 rounded-lg bg-accent-blue/10 text-accent-blue">
            <CheckCircle2 size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Tasks
            </p>
            <p className="text-xl md:text-2xl font-bold">
              {completedToday}/{todaysTasks.length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 md:gap-4 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
          <div className="p-2 md:p-3 rounded-lg bg-accent-green/10 text-accent-green">
            <Briefcase size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Active Apps
            </p>
            <p className="text-xl md:text-2xl font-bold">{activeApps}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 md:gap-4 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
          <div className="p-2 md:p-3 rounded-lg bg-accent-orange/10 text-accent-orange">
            <Calendar size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Interviews
            </p>
            <p className="text-xl md:text-2xl font-bold">{interviewCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 md:gap-4 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
          <div className="p-2 md:p-3 rounded-lg bg-accent-red/10 text-accent-red">
            <Flame size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Streak
            </p>
            <p className="text-xl md:text-2xl font-bold">{currentStreak} Days</p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Today's Focus
            <span className="text-xs text-text-tertiary font-normal border border-bg-active px-1.5 py-0.5 rounded hidden md:inline">
              Press N to add
            </span>
          </h2>

          <TaskList
            tasks={todaysTasks}
            subjects={subjects}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onAddTask={handleAddTask}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6 order-1 lg:order-2">
          {/* Week Calendar */}
          <Card>
            <h3 className="text-sm font-semibold mb-4 px-2">This Week</h3>
            <div className="grid grid-cols-7 gap-0.5 md:gap-1">
              {weekDays.map((day) => {
                const isToday = isSameDay(day, today);
                const dayStr = formatDate(day);
                const dayTasks = tasks.filter((t) => t.date === dayStr);
                const allDone =
                  dayTasks.length > 0 && dayTasks.every((t) => t.completed);

                return (
                  <div
                    key={day.toString()}
                    className="flex flex-col items-center gap-1 md:gap-2 p-1 md:p-2 rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer"
                  >
                    <span
                      className={`text-[10px] md:text-xs ${
                        isToday ? 'text-accent-blue font-bold' : 'text-text-tertiary'
                      }`}
                    >
                      {format(day, 'EEE')}
                    </span>
                    <div
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${
                        isToday
                          ? 'bg-accent-blue text-white'
                          : 'bg-bg-tertiary text-text-primary'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                    {allDone && (
                      <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-accent-green" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Upcoming Interview */}
          {upcomingInterview && (
            <Card className="p-4 md:p-5 border-accent-blue/20 bg-gradient-to-b from-bg-secondary to-accent-blue/5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-orange" />
                Upcoming Interview
              </h3>
              <div className="space-y-1">
                <p className="text-base font-bold text-text-primary">
                  {jobs.find((j) => j.id === upcomingInterview.jobId)?.company ||
                    'Company'}
                </p>
                <p className="text-sm text-text-secondary capitalize">
                  {upcomingInterview.type} Interview
                </p>
                <p className="text-xs text-accent-blue mt-2 font-medium">
                  {format(
                    upcomingInterview.date?.toDate?.() ||
                      new Date(upcomingInterview.date as any),
                    'MMM d'
                  )}
                  , {upcomingInterview.time}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
