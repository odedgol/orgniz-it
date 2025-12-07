'use client';

import React, { useState } from 'react';
import { Check, Trash2, ChevronDown } from 'lucide-react';
import type { Task, Subject } from '@/types';

interface TaskListGroupedProps {
  tasks: Task[];
  subjects: Subject[];
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

interface GroupedTasks {
  subject: Subject | null;
  tasks: Task[];
}

export const TaskListGrouped: React.FC<TaskListGroupedProps> = ({
  tasks,
  subjects,
  onToggle,
  onDelete,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Group tasks by subject
  const groupedTasks: GroupedTasks[] = subjects
    .map((subject) => ({
      subject,
      tasks: tasks.filter((t) => t.subjectId === subject.id),
    }))
    .filter((group) => group.tasks.length > 0);

  // Add tasks without a subject
  const unassignedTasks = tasks.filter(
    (t) => !t.subjectId || !subjects.find((s) => s.id === t.subjectId)
  );
  if (unassignedTasks.length > 0) {
    groupedTasks.push({ subject: null, tasks: unassignedTasks });
  }

  const toggleGroup = (subjectId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center text-text-tertiary">
        <p>No tasks for today. Add one below!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-bg-active/50">
      {groupedTasks.map((group) => {
        const subjectId = group.subject?.id || 'unassigned';
        const isCollapsed = collapsedGroups.has(subjectId);
        const taskCount = group.tasks.length;
        const completedCount = group.tasks.filter((t) => t.completed).length;

        return (
          <div key={subjectId} className="overflow-hidden">
            {/* Subject Header */}
            <button
              onClick={() => toggleGroup(subjectId)}
              className="w-full flex items-center gap-2.5 px-4 py-3 bg-bg-primary/50 hover:bg-bg-tertiary transition-colors"
            >
              {/* Subject color dot */}
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: group.subject?.color || '#6B6B70' }}
              />

              {/* Subject name */}
              <span className="flex-1 text-left text-sm font-semibold text-text-primary">
                {group.subject?.name || 'Unassigned'}
              </span>

              {/* Task count */}
              <span className="text-xs text-text-muted">
                {completedCount}/{taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </span>

              {/* Chevron */}
              <ChevronDown
                size={14}
                className={`text-text-muted transition-transform ${
                  isCollapsed ? '-rotate-90' : ''
                }`}
              />
            </button>

            {/* Tasks Tree */}
            {!isCollapsed && (
              <div className="pl-4">
                {group.tasks
                  .sort((a, b) => {
                    const timeA = a.startTime || '23:59';
                    const timeB = b.startTime || '23:59';
                    return timeA.localeCompare(timeB);
                  })
                  .map((task, index) => {
                    const isLast = index === group.tasks.length - 1;

                    return (
                      <div
                        key={task.id}
                        className={`group relative flex items-center gap-2.5 py-3 pr-4 pl-4 transition-colors hover:bg-bg-tertiary/50 ${
                          task.completed ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Tree line connector */}
                        <div
                          className={`absolute left-[5px] top-0 w-0.5 bg-bg-active ${
                            isLast ? 'h-1/2' : 'h-full'
                          }`}
                        />
                        <div className="absolute left-[5px] top-1/2 w-3 h-0.5 bg-bg-active" />

                        {/* Checkbox */}
                        <button
                          onClick={() => onToggle(task.id)}
                          className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-all flex-shrink-0 ml-3 ${
                            task.completed
                              ? 'bg-accent-green border-accent-green'
                              : 'border-2 border-text-muted hover:border-text-secondary'
                          }`}
                        >
                          {task.completed && (
                            <Check size={11} className="text-white" strokeWidth={3} />
                          )}
                        </button>

                        {/* Task title */}
                        <span
                          className={`flex-1 text-sm ${
                            task.completed
                              ? 'line-through text-text-muted'
                              : 'text-text-primary'
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Time */}
                        <span className="text-xs font-mono text-text-muted">
                          {task.startTime || '--:--'}
                        </span>

                        {/* Delete button */}
                        <button
                          onClick={() => onDelete(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent-red transition-all p-1"
                        >
                          <Trash2 size={14} />
                        </button>
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
