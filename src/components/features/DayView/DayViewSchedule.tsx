'use client';

import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Check } from 'lucide-react';
import type { Task, Subject } from '@/types';

interface Interview {
  id: string;
  jobId: string;
  type: string;
  time?: string;
}

interface Job {
  id: string;
  company: string;
}

interface DayViewScheduleProps {
  tasks: Task[];
  subjects: Subject[];
  interviews: Interview[];
  jobs: Job[];
  selectedDate: Date;
  onToggleTask: (taskId: string) => void;
  onSelectDate: (date: Date) => void;
}

export const DayViewSchedule: React.FC<DayViewScheduleProps> = ({
  tasks,
  subjects,
  interviews,
  jobs,
  selectedDate,
  onToggleTask,
  onSelectDate,
}) => {
  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const completedCount = tasks.filter((t) => t.completed).length;

  const getTimePosition = (time?: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return ((hours - 8) * 60 + minutes); // Minutes from 8 AM
  };

  const getBlockHeight = (startTime?: string, endTime?: string): number => {
    if (!startTime || !endTime) return 60;
    const start = getTimePosition(startTime);
    const end = getTimePosition(endTime);
    return Math.max(end - start, 30);
  };

  // Get current time position
  const now = new Date();
  const currentMinutes = (now.getHours() - 8) * 60 + now.getMinutes();
  const showCurrentTime = currentMinutes >= 0 && currentMinutes <= 600;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Week Day Navigation */}
      <div className="flex justify-center gap-2 mb-4">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          return (
            <button
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all w-[60px] border ${
                isSelected
                  ? 'bg-accent-blue text-white border-accent-blue'
                  : 'bg-bg-secondary border-bg-active hover:bg-bg-tertiary'
              }`}
            >
              <span className={`text-xs uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-text-tertiary'}`}>
                {format(day, 'EEE')}
              </span>
              <span className={`text-lg font-semibold mt-1 ${isSelected ? 'text-white' : ''}`}>
                {format(day, 'd')}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isToday && !isSelected ? 'bg-accent-green' : 'bg-transparent'}`} />
            </button>
          );
        })}
      </div>

      {/* Date Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">{format(selectedDate, 'EEEE, MMM d')}</h2>
        <p className="text-sm text-text-tertiary mt-1">
          {tasks.length} tasks scheduled • {completedCount} completed
        </p>
      </div>

      {/* Schedule Grid */}
      <div className="flex-1 overflow-auto bg-bg-secondary border border-bg-active rounded-xl">
        <div className="grid grid-cols-[80px_1fr] min-h-full">
          {/* Time Column */}
          <div className="border-r border-bg-active/50 bg-bg-primary/50">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] flex items-start justify-end pr-3 pt-1">
                <span className="text-xs text-text-muted font-medium">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </span>
              </div>
            ))}
          </div>

          {/* Blocks Column */}
          <div className="relative">
            {/* Hour lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-bg-active/30"
                style={{ top: `${(hour - 8) * 60}px` }}
              />
            ))}

            {/* Current time indicator */}
            {showCurrentTime && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-accent-red z-10"
                style={{ top: `${currentMinutes}px` }}
              >
                <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-accent-red" />
              </div>
            )}

            {/* Task Blocks */}
            {tasks.map((task) => {
              const subject = subjects.find((s) => s.id === task.subjectId);
              const top = getTimePosition(task.startTime);
              const height = getBlockHeight(task.startTime, task.endTime);

              if (top < 0 || top > 600) return null;

              return (
                <div
                  key={task.id}
                  className={`absolute left-2 right-2 rounded-lg p-2.5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
                    task.completed ? 'opacity-50' : ''
                  }`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    background: `linear-gradient(135deg, ${subject?.color || '#5E6AD2'} 0%, ${subject?.color || '#5E6AD2'}CC 100%)`,
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className={`absolute top-2 right-2 w-4 h-4 rounded border-2 flex items-center justify-center ${
                      task.completed
                        ? 'bg-white border-white'
                        : 'border-white/50 hover:border-white'
                    }`}
                  >
                    {task.completed && <Check size={10} className="text-accent-green" />}
                  </button>
                  <div className="text-xs text-white/70 mb-1">
                    {task.startTime} - {task.endTime}
                  </div>
                  <div className={`text-sm font-semibold text-white ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </div>
                  {height > 50 && (
                    <div className="text-xs text-white/60 mt-1">{subject?.name}</div>
                  )}
                </div>
              );
            })}

            {/* Interview Blocks */}
            {interviews.map((interview) => {
              const job = jobs.find((j) => j.id === interview.jobId);
              const top = getTimePosition(interview.time);

              if (top < 0 || top > 600) return null;

              return (
                <div
                  key={interview.id}
                  className="absolute left-2 right-2 rounded-lg p-2.5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    top: `${top}px`,
                    height: '55px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  }}
                >
                  <div className="text-xs text-white/70 mb-1">{interview.time}</div>
                  <div className="text-sm font-semibold text-white">
                    🎤 {job?.company} - {interview.type}
                  </div>
                </div>
              );
            })}

            {/* Min height for scroll */}
            <div style={{ height: `${10 * 60}px` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
