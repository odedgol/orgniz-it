'use client';

import React from 'react';
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

interface DayViewTimelineProps {
  tasks: Task[];
  subjects: Subject[];
  interviews: Interview[];
  jobs: Job[];
  onToggleTask: (taskId: string) => void;
}

export const DayViewTimeline: React.FC<DayViewTimelineProps> = ({
  tasks,
  subjects,
  interviews,
  jobs,
  onToggleTask,
}) => {
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

  const formatHour = (hour: number) => {
    if (hour > 12) return `${hour - 12} PM`;
    if (hour === 12) return '12 PM';
    return `${hour} AM`;
  };

  const getTasksForHour = (hour: number) => {
    const hourStr = hour.toString().padStart(2, '0');
    return tasks.filter((t) => t.startTime?.startsWith(hourStr));
  };

  const getInterviewsForHour = (hour: number) => {
    const hourStr = hour.toString().padStart(2, '0');
    return interviews.filter((i) => i.time?.startsWith(hourStr));
  };

  return (
    <div className="flex-1 overflow-y-auto rounded-xl border border-bg-active bg-bg-secondary">
      {hours.map((hour) => {
        const hourTasks = getTasksForHour(hour);
        const hourInterviews = getInterviewsForHour(hour);

        return (
          <div
            key={hour}
            className="group flex border-b border-bg-active/50 min-h-[80px]"
          >
            <div className="w-16 py-3 px-2 border-r border-bg-active/50 text-right flex-shrink-0">
              <span className="text-xs text-text-tertiary font-medium">
                {formatHour(hour)}
              </span>
            </div>
            <div className="flex-1 relative p-2 group-hover:bg-bg-tertiary/30 transition-colors">
              {/* Tasks */}
              {hourTasks.map((task) => {
                const subject = subjects.find((s) => s.id === task.subjectId);
                return (
                  <div
                    key={task.id}
                    className={`mb-1 p-2.5 rounded-md text-xs border-l-4 flex items-start gap-2.5 transition-all hover:shadow-md ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                    style={{
                      backgroundColor: `${subject?.color || '#5E6AD2'}15`,
                      borderLeftColor: subject?.color || '#5E6AD2',
                    }}
                  >
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-colors border-2 ${
                        task.completed
                          ? 'bg-accent-green border-accent-green'
                          : 'border-current hover:border-text-secondary'
                      }`}
                      style={{ borderColor: task.completed ? undefined : subject?.color || '#5E6AD2' }}
                    >
                      {task.completed && <Check size={10} className="text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`font-semibold block ${task.completed ? 'line-through' : ''}`}
                        style={{ color: subject?.color || '#5E6AD2' }}
                      >
                        {task.title}
                      </span>
                      <span className="text-text-secondary">
                        {task.startTime} - {task.endTime} {subject && `• ${subject.name}`}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Interviews */}
              {hourInterviews.map((interview) => {
                const job = jobs.find((j) => j.id === interview.jobId);
                return (
                  <div
                    key={interview.id}
                    className="mb-1 bg-accent-red/15 border-l-4 border-accent-red p-2.5 rounded-md text-xs"
                  >
                    <span className="text-accent-red font-semibold block">
                      🎤 {job?.company} - {interview.type}
                    </span>
                    <span className="text-text-secondary">{interview.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
