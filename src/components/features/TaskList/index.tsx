'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui';
import { TaskListHeader } from './TaskListHeader';
import { TaskListTimeline } from './TaskListTimeline';
import { TaskListGrouped } from './TaskListGrouped';
import type { Task, Subject } from '@/types';

export type ViewMode = 'timeline' | 'grouped';

interface TaskListProps {
  tasks: Task[];
  subjects: Subject[];
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAddTask: (title: string, subjectId: string) => void;
  defaultViewMode?: ViewMode;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  subjects,
  onToggle,
  onDelete,
  onAddTask,
  defaultViewMode = 'timeline',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask(newTaskTitle.trim(), selectedSubject || subjects[0]?.id || '');
    setNewTaskTitle('');
    setSelectedSubject('');
  };

  return (
    <Card className="overflow-hidden min-h-[400px] flex flex-col p-0">
      <TaskListHeader
        completed={completedCount}
        total={totalCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="flex-1 overflow-auto">
        {viewMode === 'timeline' ? (
          <TaskListTimeline
            tasks={tasks}
            subjects={subjects}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ) : (
          <TaskListGrouped
            tasks={tasks}
            subjects={subjects}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        )}
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 mt-auto border-t border-bg-active bg-bg-primary/50"
      >
        <div className="flex items-center gap-3">
          <Plus size={18} className="text-text-muted flex-shrink-0" />
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
              className="bg-bg-secondary border border-bg-active rounded px-2 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-text-muted"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <span className="text-xs border border-bg-active px-1.5 py-0.5 rounded text-text-muted">
            Enter
          </span>
        </div>
      </form>
    </Card>
  );
};

export { TaskListHeader } from './TaskListHeader';
export { TaskListTimeline } from './TaskListTimeline';
export { TaskListGrouped } from './TaskListGrouped';
