'use client';

import React, { useState } from 'react';
import { Check, Plus, GripVertical } from 'lucide-react';
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

interface DayViewKanbanProps {
  tasks: Task[];
  subjects: Subject[];
  interviews: Interview[];
  jobs: Job[];
  onToggleTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAddTask: () => void;
}

interface TimeColumn {
  id: string;
  name: string;
  emoji: string;
  startHour: number;
  endHour: number;
  color: string;
  defaultStartTime: string;
  defaultEndTime: string;
}

const timeColumns: TimeColumn[] = [
  { id: 'morning', name: 'Morning', emoji: '🌅', startHour: 6, endHour: 12, color: '#F59E0B', defaultStartTime: '09:00', defaultEndTime: '10:00' },
  { id: 'midday', name: 'Midday', emoji: '☀️', startHour: 12, endHour: 15, color: '#22D3EE', defaultStartTime: '12:00', defaultEndTime: '13:00' },
  { id: 'afternoon', name: 'Afternoon', emoji: '🌤️', startHour: 15, endHour: 18, color: '#5E6AD2', defaultStartTime: '15:00', defaultEndTime: '16:00' },
  { id: 'evening', name: 'Evening', emoji: '🌙', startHour: 18, endHour: 24, color: '#9F7AEA', defaultStartTime: '18:00', defaultEndTime: '19:00' },
];

export const DayViewKanban: React.FC<DayViewKanbanProps> = ({
  tasks,
  subjects,
  interviews,
  jobs,
  onToggleTask,
  onUpdateTask,
  onAddTask,
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const getTimeHour = (time?: string): number => {
    if (!time) return 12;
    const [hours] = time.split(':').map(Number);
    return hours;
  };

  const getTasksForColumn = (column: TimeColumn) => {
    return tasks.filter((t) => {
      const hour = getTimeHour(t.startTime);
      return hour >= column.startHour && hour < column.endHour;
    });
  };

  const getInterviewsForColumn = (column: TimeColumn) => {
    return interviews.filter((i) => {
      const hour = getTimeHour(i.time);
      return hour >= column.startHour && hour < column.endHour;
    });
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    // Add a slight delay to show the drag effect
    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the column entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.closest(`[data-column]`)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumn: TimeColumn) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTask) return;

    // Check if task is already in this column
    const currentHour = getTimeHour(draggedTask.startTime);
    if (currentHour >= targetColumn.startHour && currentHour < targetColumn.endHour) {
      setDraggedTask(null);
      return;
    }

    // Calculate new times - preserve duration
    const oldStart = draggedTask.startTime || '09:00';
    const oldEnd = draggedTask.endTime || '10:00';

    const [oldStartH, oldStartM] = oldStart.split(':').map(Number);
    const [oldEndH, oldEndM] = oldEnd.split(':').map(Number);
    const durationMinutes = (oldEndH * 60 + oldEndM) - (oldStartH * 60 + oldStartM);

    // Set new start time to default for the column
    const newStartTime = targetColumn.defaultStartTime;
    const [newStartH, newStartM] = newStartTime.split(':').map(Number);
    const newEndMinutes = newStartH * 60 + newStartM + durationMinutes;
    const newEndH = Math.floor(newEndMinutes / 60);
    const newEndM = newEndMinutes % 60;
    const newEndTime = `${newEndH.toString().padStart(2, '0')}:${newEndM.toString().padStart(2, '0')}`;

    // Update the task
    onUpdateTask(draggedTask.id, {
      startTime: newStartTime,
      endTime: newEndTime,
    });

    setDraggedTask(null);
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="grid grid-cols-4 gap-4 min-w-[800px] h-full">
        {timeColumns.map((column) => {
          const columnTasks = getTasksForColumn(column);
          const columnInterviews = getInterviewsForColumn(column);
          const completedCount = columnTasks.filter((t) => t.completed).length;
          const totalCount = columnTasks.length;
          const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          const isDropTarget = dragOverColumn === column.id && draggedTask;
          const isDraggedTaskColumn = draggedTask && getTimeHour(draggedTask.startTime) >= column.startHour && getTimeHour(draggedTask.startTime) < column.endHour;

          return (
            <div
              key={column.name}
              data-column={column.id}
              className={`bg-bg-secondary border rounded-xl flex flex-col min-h-[500px] transition-all ${
                isDropTarget && !isDraggedTaskColumn
                  ? 'border-accent-blue ring-2 ring-accent-blue/20 bg-accent-blue/5'
                  : 'border-bg-active'
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column)}
            >
              {/* Column Header */}
              <div
                className="p-4 border-b border-bg-active"
                style={{ borderTop: `3px solid ${column.color}` }}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <div className="text-sm font-semibold">{column.emoji} {column.name}</div>
                    <div className="text-xs text-text-muted">
                      {column.startHour > 12 ? column.startHour - 12 : column.startHour}
                      {column.startHour >= 12 ? ' PM' : ' AM'} - {' '}
                      {column.endHour > 12 ? column.endHour - 12 : column.endHour}
                      {column.endHour >= 12 ? ' PM' : ' AM'}
                    </div>
                  </div>
                  <span className="text-xs text-text-muted bg-bg-tertiary px-2 py-0.5 rounded-full">
                    {totalCount + columnInterviews.length}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="h-1 bg-bg-tertiary rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: progressPercent === 100 ? '#3DCC79' : column.color,
                    }}
                  />
                </div>
              </div>

              {/* Column Body */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {/* Drop Zone Indicator */}
                {isDropTarget && !isDraggedTaskColumn && (
                  <div className="border-2 border-dashed border-accent-blue rounded-lg p-4 text-center text-accent-blue text-xs bg-accent-blue/10">
                    Drop here to move to {column.name.toLowerCase()}
                  </div>
                )}

                {/* Tasks */}
                {columnTasks
                  .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                  .map((task) => {
                    const subject = subjects.find((s) => s.id === task.subjectId);
                    const isDragging = draggedTask?.id === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`bg-bg-tertiary border border-bg-active rounded-lg p-3 cursor-grab transition-all hover:border-text-muted/30 hover:shadow-md active:cursor-grabbing ${
                          task.completed ? 'opacity-50' : ''
                        } ${isDragging ? 'opacity-50 scale-95' : 'hover:translate-y-[-2px]'}`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <GripVertical size={14} className="text-text-muted flex-shrink-0 mt-0.5 opacity-50" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id);
                            }}
                            className={`w-4 h-4 rounded flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                              task.completed
                                ? 'bg-accent-green border-accent-green'
                                : 'border-2 border-text-muted hover:border-text-secondary'
                            }`}
                          >
                            {task.completed && <Check size={10} className="text-white" />}
                          </button>
                          <span
                            className={`text-sm font-medium flex-1 ${
                              task.completed ? 'line-through text-text-muted' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center justify-between ml-6">
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${subject?.color || '#5E6AD2'}20`,
                              color: subject?.color || '#5E6AD2',
                            }}
                          >
                            {subject?.name || 'No Subject'}
                          </span>
                          <span className="text-xs text-text-muted">
                            {task.startTime} - {task.endTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {/* Interviews (not draggable) */}
                {columnInterviews.map((interview) => {
                  const job = jobs.find((j) => j.id === interview.jobId);
                  return (
                    <div
                      key={interview.id}
                      className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm">🎤</span>
                        <span className="text-sm font-semibold text-accent-red">
                          {job?.company || 'Company'}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted">
                        {interview.type} • {interview.time}
                      </div>
                    </div>
                  );
                })}

                {/* Empty State */}
                {columnTasks.length === 0 && columnInterviews.length === 0 && !isDropTarget && (
                  <div className="text-center py-8 text-text-muted text-xs">
                    No tasks scheduled
                  </div>
                )}

                {/* Add Task Button */}
                <button
                  onClick={onAddTask}
                  className="w-full border-2 border-dashed border-bg-active rounded-lg p-3 text-center text-text-muted text-xs hover:border-text-muted/30 hover:text-text-secondary transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={14} />
                  Add {column.name.toLowerCase()} task
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
