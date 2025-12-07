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

interface DayViewAgendaProps {
  tasks: Task[];
  subjects: Subject[];
  interviews: Interview[];
  jobs: Job[];
  onToggleTask: (taskId: string) => void;
}

interface TimeSection {
  name: string;
  emoji: string;
  startHour: number;
  endHour: number;
}

const timeSections: TimeSection[] = [
  { name: 'Morning', emoji: '🌅', startHour: 6, endHour: 12 },
  { name: 'Afternoon', emoji: '☀️', startHour: 12, endHour: 18 },
  { name: 'Evening', emoji: '🌙', startHour: 18, endHour: 24 },
];

export const DayViewAgenda: React.FC<DayViewAgendaProps> = ({
  tasks,
  subjects,
  interviews,
  jobs,
  onToggleTask,
}) => {
  const completedCount = tasks.filter((t) => t.completed).length;
  const remainingCount = tasks.filter((t) => !t.completed).length;

  const getTimeHour = (time?: string): number => {
    if (!time) return 12;
    const [hours] = time.split(':').map(Number);
    return hours;
  };

  const getTasksForSection = (section: TimeSection) => {
    return tasks.filter((t) => {
      const hour = getTimeHour(t.startTime);
      return hour >= section.startHour && hour < section.endHour;
    });
  };

  const getInterviewsForSection = (section: TimeSection) => {
    return interviews.filter((i) => {
      const hour = getTimeHour(i.time);
      return hour >= section.startHour && hour < section.endHour;
    });
  };

  const formatDuration = (startTime?: string, endTime?: string): string => {
    if (!startTime || !endTime) return '';
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const minutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}.${Math.round(mins / 6)} hours` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-secondary border border-bg-active rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-accent-green">{completedCount}</div>
          <div className="text-xs text-text-tertiary mt-1">Completed</div>
        </div>
        <div className="bg-bg-secondary border border-bg-active rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-accent-blue">{remainingCount}</div>
          <div className="text-xs text-text-tertiary mt-1">Remaining</div>
        </div>
        <div className="bg-bg-secondary border border-bg-active rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-accent-orange">{interviews.length}</div>
          <div className="text-xs text-text-tertiary mt-1">Interviews</div>
        </div>
      </div>

      {/* Time Sections */}
      {timeSections.map((section) => {
        const sectionTasks = getTasksForSection(section);
        const sectionInterviews = getInterviewsForSection(section);
        const itemCount = sectionTasks.length + sectionInterviews.length;

        return (
          <div key={section.name} className="bg-bg-secondary border border-bg-active rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-bg-active">
              <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                {section.emoji} {section.name}
              </span>
              <span className="text-xs text-text-muted bg-bg-tertiary px-2 py-0.5 rounded-full">
                {itemCount} items
              </span>
            </div>

            {itemCount === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">
                No tasks scheduled for the {section.name.toLowerCase()}
              </div>
            ) : (
              <div className="divide-y divide-bg-active/50">
                {/* Tasks */}
                {sectionTasks
                  .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                  .map((task) => {
                    const subject = subjects.find((s) => s.id === task.subjectId);
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-4 p-4 hover:bg-bg-tertiary/50 transition-colors ${
                          task.completed ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="w-16 text-center flex-shrink-0">
                          <div className="text-sm font-semibold">{task.startTime?.slice(0, 5)}</div>
                          <div className="text-xs text-text-muted">{task.endTime?.slice(0, 5)}</div>
                        </div>
                        <div
                          className="w-0.5 h-10 rounded-full flex-shrink-0"
                          style={{ backgroundColor: subject?.color || '#5E6AD2' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${task.completed ? 'line-through text-text-muted' : ''}`}>
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: `${subject?.color || '#5E6AD2'}20`,
                                color: subject?.color || '#5E6AD2',
                              }}
                            >
                              {subject?.name || 'No Subject'}
                            </span>
                            <span className="text-xs text-text-muted">
                              {formatDuration(task.startTime, task.endTime)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                            task.completed
                              ? 'bg-accent-green border-accent-green'
                              : 'border-text-muted hover:border-text-secondary'
                          }`}
                        >
                          {task.completed && <Check size={12} className="text-white" />}
                        </button>
                      </div>
                    );
                  })}

                {/* Interviews */}
                {sectionInterviews.map((interview) => {
                  const job = jobs.find((j) => j.id === interview.jobId);
                  return (
                    <div
                      key={interview.id}
                      className="flex items-center gap-4 p-4 bg-accent-red/5 hover:bg-accent-red/10 transition-colors"
                    >
                      <div className="w-16 text-center flex-shrink-0">
                        <div className="text-sm font-semibold">{interview.time?.slice(0, 5)}</div>
                        <div className="text-xs text-text-muted">60 min</div>
                      </div>
                      <div className="w-0.5 h-10 rounded-full bg-accent-red flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          🎤 {job?.company || 'Company'} - {interview.type}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-accent-red/20 text-accent-red">
                            Interview
                          </span>
                        </div>
                      </div>
                      <span className="text-lg">📍</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
