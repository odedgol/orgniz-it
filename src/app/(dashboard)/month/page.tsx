'use client';

import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useTaskStore } from '@/stores/taskStore';
import { useInterviewStore } from '@/stores/interviewStore';
import { useUIStore } from '@/stores/uiStore';
import { formatDate } from '@/lib/utils';

export default function MonthViewPage() {
  const { tasks } = useTaskStore();
  const { interviews } = useInterviewStore();
  const { selectedDate, navigateDate, setSelectedDate } = useUIStore();

  const today = new Date();
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Month View</h1>
        <div className="flex items-center gap-6">
          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent-blue" />
              <span className="text-xs text-text-secondary">Task</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent-orange" />
              <span className="text-xs text-text-secondary">Interview</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent-green" />
              <span className="text-xs text-text-secondary">Done</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 bg-bg-secondary border border-bg-active rounded-lg p-1">
            <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm font-medium w-32 text-center">
              {format(selectedDate, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight size={16} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-bg-active border border-bg-active rounded-xl overflow-hidden shadow-2xl">
        {/* Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-bg-primary p-3 text-center text-xs font-semibold text-text-tertiary uppercase tracking-wider"
          >
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isSameDay(day, today);
          const dateStr = formatDate(day);

          const dayTasks = tasks.filter((t) => t.date === dateStr);
          const dayInterviews = interviews.filter((i) => {
            const interviewDate = i.date?.toDate?.() || new Date(i.date as any);
            return isSameDay(interviewDate, day);
          });

          const completed = dayTasks.filter((t) => t.completed).length;
          const allDone = dayTasks.length > 0 && completed === dayTasks.length;

          return (
            <div
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`bg-bg-secondary min-h-[120px] p-2 hover:bg-bg-tertiary transition-colors relative flex flex-col gap-1 cursor-pointer ${
                !isCurrentMonth ? 'opacity-30' : ''
              }`}
            >
              <span
                className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                  isTodayDate
                    ? 'bg-accent-blue text-white'
                    : 'text-text-secondary'
                }`}
              >
                {format(day, 'd')}
              </span>

              {/* Events */}
              <div className="flex-1 flex flex-col gap-1">
                {dayInterviews.slice(0, 2).map((interview) => (
                  <div
                    key={interview.id}
                    className="bg-accent-orange/20 text-accent-orange text-[10px] px-1.5 py-0.5 rounded truncate font-medium border-l-2 border-accent-orange"
                  >
                    {interview.time} {interview.type}
                  </div>
                ))}

                {dayTasks.length > 0 && (
                  <div className="mt-auto flex items-center justify-between px-1">
                    <div className="flex -space-x-1">
                      {dayTasks.slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          className={`w-1.5 h-1.5 rounded-full ring-1 ring-bg-secondary ${
                            t.completed ? 'bg-accent-green' : 'bg-accent-blue'
                          }`}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary ring-1 ring-bg-secondary" />
                      )}
                    </div>
                    {allDone && (
                      <span className="text-[10px] text-accent-green">🔥</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
