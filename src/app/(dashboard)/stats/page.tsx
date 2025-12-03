'use client';

import React from 'react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Flame, CheckCircle2, Briefcase, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { useSubjectStore } from '@/stores/subjectStore';
import { useJobStore } from '@/stores/jobStore';
import { useStreak } from '@/hooks/useStreak';
import { formatDate } from '@/lib/utils';

export default function StatsPage() {
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();
  const { subjects } = useSubjectStore();
  const { jobs } = useJobStore();
  const { currentStreak, longestStreak } = useStreak();

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Calculate activity data for the week
  const activityData = weekDays.map((day) => {
    const dateStr = formatDate(day);
    const dayTasks = tasks.filter((t) => t.date === dateStr && t.completed);
    return {
      day: format(day, 'EEE'),
      tasks: dayTasks.length,
      isToday: formatDate(day) === formatDate(today),
    };
  });

  // Calculate subject breakdown
  const subjectData = subjects
    .map((s) => ({
      name: s.name,
      value: tasks.filter((t) => t.subjectId === s.id && t.completed).length,
      color: s.color,
    }))
    .filter((d) => d.value > 0);

  // Calculate pipeline data
  const pipelineData = [
    { name: 'Wishlist', value: jobs.filter((j) => j.status === 'wishlist').length },
    { name: 'Applied', value: jobs.filter((j) => j.status === 'applied').length },
    { name: 'Screening', value: jobs.filter((j) => j.status === 'screening').length },
    { name: 'Interview', value: jobs.filter((j) => j.status === 'interview').length },
    { name: 'Offer', value: jobs.filter((j) => j.status === 'offer').length },
  ];

  // Calculate stats
  const totalTasksThisWeek = tasks.filter((t) => {
    const taskDate = new Date(t.date);
    return taskDate >= weekStart && taskDate <= weekEnd;
  }).length;

  const completedTasksThisWeek = tasks.filter((t) => {
    const taskDate = new Date(t.date);
    return taskDate >= weekStart && taskDate <= weekEnd && t.completed;
  }).length;

  const totalApplications = jobs.length;
  const responseRate =
    totalApplications > 0
      ? Math.round(
          (jobs.filter((j) => j.status !== 'wishlist' && j.status !== 'applied').length /
            jobs.filter((j) => j.status !== 'wishlist').length) *
            100
        ) || 0
      : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-text-primary">Weekly Insights</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-accent-orange/10 text-accent-orange">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Current Streak
            </p>
            <p className="text-2xl font-bold">{currentStreak} days</p>
            <p className="text-xs text-text-tertiary">Best: {longestStreak}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-accent-blue/10 text-accent-blue">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Tasks This Week
            </p>
            <p className="text-2xl font-bold">{completedTasksThisWeek}</p>
            <p className="text-xs text-text-tertiary">of {totalTasksThisWeek} total</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-accent-green/10 text-accent-green">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Applications
            </p>
            <p className="text-2xl font-bold">{totalApplications}</p>
            <p className="text-xs text-text-tertiary">total tracked</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-accent-purple/10 text-accent-purple">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Response Rate
            </p>
            <p className="text-2xl font-bold">{responseRate}%</p>
            <p className="text-xs text-text-tertiary">after applying</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-8">
        {/* Activity Chart */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-6 text-text-secondary uppercase tracking-wider">
            Task Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis
                  dataKey="day"
                  stroke="#4A4A4F"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#4A4A4F" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1C1F',
                    borderColor: '#2A2A30',
                    borderRadius: '8px',
                    color: '#FAFAFA',
                  }}
                  itemStyle={{ color: '#FAFAFA' }}
                  cursor={{ fill: '#2A2A30' }}
                />
                <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                  {activityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isToday ? '#5E6AD2' : '#2A2A30'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subject Breakdown */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-6 text-text-secondary uppercase tracking-wider">
            Focus Areas
          </h3>
          {subjectData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-text-tertiary">
              <p>Complete some tasks to see your focus areas</p>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="h-64 w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                {subjectData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-text-secondary">{s.name}</span>
                    </div>
                    <span className="font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Pipeline Funnel */}
        <Card className="col-span-2 p-6">
          <h3 className="text-sm font-semibold mb-6 text-text-secondary uppercase tracking-wider">
            Application Pipeline
          </h3>
          <div className="flex items-end justify-between px-12 gap-4 h-32">
            {pipelineData.map((stage) => {
              const maxValue = Math.max(...pipelineData.map((s) => s.value), 1);
              const height = stage.value === 0 ? 4 : (stage.value / maxValue) * 100;
              return (
                <div
                  key={stage.name}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <span className="text-xl font-bold text-text-primary mb-1">
                    {stage.value}
                  </span>
                  <div
                    className="w-full bg-bg-active rounded-t-lg transition-all group-hover:bg-accent-blue"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-text-tertiary font-medium uppercase">
                    {stage.name}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
