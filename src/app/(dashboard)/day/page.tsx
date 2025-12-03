'use client';

import React, { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Label, Select } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { useSubjectStore } from '@/stores/subjectStore';
import { useInterviewStore } from '@/stores/interviewStore';
import { useJobStore } from '@/stores/jobStore';
import { useUIStore } from '@/stores/uiStore';
import { formatDate } from '@/lib/utils';

export default function DayViewPage() {
  const { user } = useAuthStore();
  const { tasks, addTask, updateTask } = useTaskStore();
  const { subjects } = useSubjectStore();
  const { interviews } = useInterviewStore();
  const { jobs } = useJobStore();
  const { selectedDate, navigateDate, setSelectedDate } = useUIStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskStartTime, setNewTaskStartTime] = useState('09:00');
  const [newTaskEndTime, setNewTaskEndTime] = useState('10:00');

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
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

  const formatHour = (hour: number) => {
    if (hour > 12) return `${hour - 12} PM`;
    if (hour === 12) return '12 PM';
    return `${hour} AM`;
  };

  const getTasksForHour = (hour: number) => {
    const hourStr = hour.toString().padStart(2, '0');
    return dayTasks.filter((t) => t.startTime?.startsWith(hourStr));
  };

  const getInterviewsForHour = (hour: number) => {
    const hourStr = hour.toString().padStart(2, '0');
    return dayInterviews.filter((i) => i.time?.startsWith(hourStr));
  };

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

  // Current time indicator position
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isToday = isSameDay(selectedDate, now);
  const timeIndicatorPosition =
    currentHour >= 7 && currentHour <= 20
      ? ((currentHour - 7) * 80 + (currentMinute / 60) * 80)
      : null;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Day View</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-bg-secondary border border-bg-active rounded-lg p-1">
            <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[200px] text-center">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
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
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Task
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-bg-active bg-bg-secondary relative">
        {hours.map((hour) => {
          const hourTasks = getTasksForHour(hour);
          const hourInterviews = getInterviewsForHour(hour);

          return (
            <div
              key={hour}
              className="group flex border-b border-bg-active/50 min-h-[80px]"
            >
              <div className="w-16 py-3 px-2 border-r border-bg-active/50 text-right">
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
                      className="mb-1 p-2 rounded text-xs border-l-4"
                      style={{
                        backgroundColor: `${subject?.color || '#5E6AD2'}20`,
                        borderLeftColor: subject?.color || '#5E6AD2',
                      }}
                    >
                      <span
                        className="font-bold block"
                        style={{ color: subject?.color || '#5E6AD2' }}
                      >
                        {task.title}
                      </span>
                      <span className="text-text-secondary">
                        {task.startTime} - {task.endTime}
                      </span>
                    </div>
                  );
                })}

                {/* Interviews */}
                {hourInterviews.map((interview) => {
                  const job = jobs.find((j) => j.id === interview.jobId);
                  return (
                    <div
                      key={interview.id}
                      className="mb-1 bg-accent-orange/20 border-l-4 border-accent-orange p-2 rounded text-xs"
                    >
                      <span className="text-accent-orange font-bold block">
                        {job?.company} - {interview.type}
                      </span>
                      <span className="text-text-secondary">{interview.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Current Time Indicator */}
        {isToday && timeIndicatorPosition !== null && (
          <div
            className="absolute left-16 right-0 border-t-2 border-accent-red z-10 flex items-center pointer-events-none"
            style={{ top: `${timeIndicatorPosition}px` }}
          >
            <div className="w-3 h-3 rounded-full bg-accent-red -ml-1.5" />
          </div>
        )}
      </div>

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
