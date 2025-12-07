'use client';

import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { Task, Subject } from '@/types';

interface TaskListTimelineProps {
  tasks: Task[];
  subjects: Subject[];
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export const TaskListTimeline: React.FC<TaskListTimelineProps> = ({
  tasks,
  subjects,
  onToggle,
  onDelete,
}) => {
  // Sort tasks by time
  const sortedTasks = [...tasks].sort((a, b) => {
    const timeA = a.startTime || '23:59';
    const timeB = b.startTime || '23:59';
    return timeA.localeCompare(timeB);
  });

  // Get current time to show indicator
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Find current task index (first uncompleted task after current time or first uncompleted)
  const currentTaskIndex = sortedTasks.findIndex((task) => {
    const taskTime = task.startTime || '23:59';
    return !task.completed && taskTime >= currentTime;
  });

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center text-text-tertiary">
        <p>No tasks for today. Add one below!</p>
      </div>
    );
  }

  return (
    <div className="relative pl-20 pr-4 py-4">
      {/* Vertical timeline line */}
      <div
        className="absolute left-[52px] top-0 bottom-0 w-0.5 bg-bg-active"
        style={{ height: `calc(100% - 60px)` }}
      />

      {sortedTasks.map((task, index) => {
        const subject = subjects.find((s) => s.id === task.subjectId);
        const isCurrentTask = index === currentTaskIndex;
        const isPastTask = task.completed || (currentTaskIndex >= 0 && index < currentTaskIndex);

        return (
          <div key={task.id} className="relative mb-4 last:mb-0">
            {/* Time label */}
            <span className="absolute left-[-80px] top-3 w-[50px] text-right text-xs font-mono text-text-muted">
              {task.startTime || '--:--'}
            </span>

            {/* Timeline dot */}
            <div
              className={`absolute left-[-28px] top-[14px] w-2 h-2 rounded-full border-2 border-bg-secondary transition-all ${
                task.completed
                  ? 'bg-accent-green'
                  : isCurrentTask
                  ? 'bg-accent-red shadow-[0_0_0_4px_rgba(239,68,68,0.2)]'
                  : 'bg-bg-tertiary'
              }`}
            />

            {/* Task card */}
            <div
              className={`group bg-bg-tertiary border border-bg-active rounded-lg p-3 transition-all hover:bg-bg-secondary hover:border-text-muted/20 ${
                task.completed ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => onToggle(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    task.completed
                      ? 'bg-accent-green border-accent-green'
                      : 'border-text-muted hover:border-text-secondary'
                  }`}
                >
                  {task.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      task.completed ? 'line-through text-text-muted' : 'text-text-primary'
                    }`}
                  >
                    {task.title}
                  </p>
                  {subject && (
                    <p className="text-xs text-text-tertiary mt-0.5">{subject.name}</p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent-red transition-all p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
