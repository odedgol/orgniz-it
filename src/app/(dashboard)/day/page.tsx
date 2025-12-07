'use client';

import React, { useState } from 'react';
import { isSameDay } from 'date-fns';
import { Modal, Input, Label, Select, Button } from '@/components/ui';
import {
  DayViewHeader,
  DayViewTimeline,
  DayViewAgenda,
  DayViewSchedule,
  DayViewKanban,
  DayViewFocus,
} from '@/components/features/DayView';
import type { DayViewMode } from '@/components/features/DayView';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { useSubjectStore } from '@/stores/subjectStore';
import { useInterviewStore } from '@/stores/interviewStore';
import { useJobStore } from '@/stores/jobStore';
import { useUIStore } from '@/stores/uiStore';
import { formatDate } from '@/lib/utils';

export default function DayViewPage() {
  const { user } = useAuthStore();
  const { tasks, addTask, toggleTask, updateTask } = useTaskStore();
  const { subjects } = useSubjectStore();
  const { interviews } = useInterviewStore();
  const { jobs } = useJobStore();
  const { selectedDate, navigateDate, setSelectedDate } = useUIStore();

  const [viewMode, setViewMode] = useState<DayViewMode>('timeline');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskStartTime, setNewTaskStartTime] = useState('09:00');
  const [newTaskEndTime, setNewTaskEndTime] = useState('10:00');

  const dateStr = formatDate(selectedDate);

  const dayTasks = tasks
    .filter((t) => t.date === dateStr)
    .sort((a, b) => {
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return a.order - b.order;
    });

  const dayInterviews = interviews.filter((i) => {
    const interviewDate = i.date?.toDate?.() || new Date(i.date as any);
    return isSameDay(interviewDate, selectedDate);
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    await addTask({
      userId: user.id,
      title: newTaskTitle,
      subjectId: newTaskSubject || subjects[0]?.id || '',
      date: dateStr,
      startTime: newTaskStartTime,
      endTime: newTaskEndTime,
    });

    setNewTaskTitle('');
    setNewTaskSubject('');
    setNewTaskStartTime('09:00');
    setNewTaskEndTime('10:00');
    setIsModalOpen(false);
  };

  const renderView = () => {
    const commonProps = {
      tasks: dayTasks,
      subjects,
      interviews: dayInterviews,
      jobs,
      onToggleTask: toggleTask,
    };

    switch (viewMode) {
      case 'timeline':
        return <DayViewTimeline {...commonProps} />;
      case 'agenda':
        return <DayViewAgenda {...commonProps} />;
      case 'schedule':
        return (
          <DayViewSchedule
            {...commonProps}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        );
      case 'kanban':
        return <DayViewKanban {...commonProps} onUpdateTask={updateTask} onAddTask={() => setIsModalOpen(true)} />;
      case 'focus':
        return <DayViewFocus {...commonProps} />;
      default:
        return <DayViewTimeline {...commonProps} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <DayViewHeader
        selectedDate={selectedDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNavigate={navigateDate}
        onToday={() => setSelectedDate(new Date())}
        onAddTask={() => setIsModalOpen(true)}
      />

      {renderView()}

      {/* Add Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Task"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What do you need to do?"
              required
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select
              id="subject"
              value={newTaskSubject}
              onChange={(e) => setNewTaskSubject(e.target.value)}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newTaskStartTime}
                onChange={(e) => setNewTaskStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newTaskEndTime}
                onChange={(e) => setNewTaskEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
