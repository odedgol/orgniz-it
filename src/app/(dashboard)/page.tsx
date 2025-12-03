'use client';

import React, { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Check, Plus, MoreHorizontal, Flame, Briefcase, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { Card, Button, Badge } from '@/src/components/ui';
import { useAuthStore } from '@/src/stores/authStore';
import { useTaskStore } from '@/src/stores/taskStore';
import { useSubjectStore } from '@/src/stores/subjectStore';
import { useJobStore } from '@/src/stores/jobStore';
import { useInterviewStore } from '@/src/stores/interviewStore';
import { useStreak } from '@/src/hooks/useStreak';
import { formatDate, getGreeting } from '@/src/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { tasks, addTask, toggleTask, deleteTask } = useTaskStore();
  const { subjects } = useSubjectStore();
  const { jobs } = useJobStore();
  const { interviews } = useInterviewStore();
  const { currentStreak } = useStreak();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

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

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    await addTask({
      userId: user.id,
      title: newTaskTitle,
      subjectId: selectedSubject || subjects[0]?.id || '',
      date: todayStr,
    });
    setNewTaskTitle('');
    setSelectedSubject('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {getGreeting()}, {user?.displayName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-text-secondary">
            {format(today, 'EEEE, MMMM d')} •{' '}
            <span className="text-accent-orange font-medium">
              🔥 {currentStreak} day streak
            </span>
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
          <div className="p-3 rounded-lg bg-accent-blue/10 text-accent-blue">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Tasks
            </p>
            <p className="text-2xl font-bold">
              {completedToday}/{todaysTasks.length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
          <div className="p-3 rounded-lg bg-accent-green/10 text-accent-green">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Active Apps
            </p>
            <p className="text-2xl font-bold">{activeApps}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
          <div className="p-3 rounded-lg bg-accent-orange/10 text-accent-orange">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Interviews
            </p>
            <p className="text-2xl font-bold">{interviewCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
          <div className="p-3 rounded-lg bg-accent-red/10 text-accent-red">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Streak
            </p>
            <p className="text-2xl font-bold">{currentStreak} Days</p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-8">
        {/* Task List */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Today's Focus
            <span className="text-xs text-text-tertiary font-normal border border-bg-active px-1.5 py-0.5 rounded">
              Press N to add
            </span>
          </h2>

          <Card className="overflow-hidden min-h-[400px] flex flex-col">
            <div className="divide-y divide-bg-active flex-1">
              {todaysTasks.length === 0 ? (
                <div className="p-8 text-center text-text-tertiary">
                  <p>No tasks for today. Add one below!</p>
                </div>
              ) : (
                todaysTasks.map((task) => {
                  const subject = subjects.find((s) => s.id === task.subjectId);
                  return (
                    <div
                      key={task.id}
                      className="group flex items-center gap-3 p-4 hover:bg-bg-tertiary transition-colors"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-accent-green border-accent-green text-bg-primary'
                            : 'border-text-muted hover:border-text-primary'
                        }`}
                      >
                        {task.completed && <Check size={12} strokeWidth={4} />}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          task.completed
                            ? 'text-text-tertiary line-through'
                            : 'text-text-primary'
                        }`}
                      >
                        {task.title}
                      </span>
                      {subject && <Badge color={subject.color}>{subject.name}</Badge>}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent-red transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Add */}
            <form
              onSubmit={handleAddTask}
              className="p-4 mt-auto border-t border-bg-active"
            >
              <div className="flex items-center gap-3">
                <Plus size={20} className="text-text-secondary" />
                <input
                  id="quick-add"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a task..."
                  className="bg-transparent border-none focus:outline-none flex-1 text-sm text-text-primary placeholder-text-muted"
                />
                {subjects.length > 0 && (
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="bg-bg-secondary border border-bg-active rounded px-2 py-1 text-xs text-text-secondary"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
                <span className="text-xs border border-bg-active px-1.5 rounded text-text-muted">
                  ↵
                </span>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Week Calendar */}
          <Card>
            <h3 className="text-sm font-semibold mb-4 px-2">This Week</h3>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => {
                const isToday = isSameDay(day, today);
                const dayStr = formatDate(day);
                const dayTasks = tasks.filter((t) => t.date === dayStr);
                const allDone =
                  dayTasks.length > 0 && dayTasks.every((t) => t.completed);

                return (
                  <div
                    key={day.toString()}
                    className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer"
                  >
                    <span
                      className={`text-xs ${
                        isToday ? 'text-accent-blue font-bold' : 'text-text-tertiary'
                      }`}
                    >
                      {format(day, 'EEE')}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isToday
                          ? 'bg-accent-blue text-white'
                          : 'bg-bg-tertiary text-text-primary'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                    {allDone && (
                      <div className="h-1.5 w-1.5 rounded-full bg-accent-green" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Upcoming Interview */}
          {upcomingInterview && (
            <Card className="p-5 border-accent-blue/20 bg-gradient-to-b from-bg-secondary to-accent-blue/5">
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
