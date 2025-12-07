'use client';

import React, { useState, useEffect } from 'react';
import { Check, Pause, Play } from 'lucide-react';
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

interface DayViewFocusProps {
  tasks: Task[];
  subjects: Subject[];
  interviews: Interview[];
  jobs: Job[];
  onToggleTask: (taskId: string) => void;
}

export const DayViewFocus: React.FC<DayViewFocusProps> = ({
  tasks,
  subjects,
  interviews,
  jobs,
  onToggleTask,
}) => {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const remainingCount = tasks.filter((t) => !t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Find current task (first incomplete task)
  const sortedTasks = [...tasks].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  const currentTask = sortedTasks.find((t) => !t.completed);
  const currentSubject = currentTask ? subjects.find((s) => s.id === currentTask.subjectId) : null;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteTask = () => {
    if (currentTask) {
      onToggleTask(currentTask.id);
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  };

  // Calculate SVG circle properties
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex-1 overflow-y-auto max-w-2xl mx-auto space-y-6">
      {/* Progress Section */}
      <div className="bg-bg-secondary border border-bg-active rounded-2xl p-6 text-center">
        <div className="w-36 h-36 mx-auto mb-5 relative">
          <svg width="144" height="144" className="transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              stroke="#2A2A30"
              strokeWidth="10"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              stroke="#3DCC79"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{Math.round(progressPercent)}%</span>
            <span className="text-xs text-text-muted">Complete</span>
          </div>
        </div>

        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="text-xl font-semibold text-accent-green">{completedCount}</div>
            <div className="text-xs text-text-muted">Done</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-accent-blue">{remainingCount}</div>
            <div className="text-xs text-text-muted">To Do</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-accent-orange">{interviews.length}</div>
            <div className="text-xs text-text-muted">Interviews</div>
          </div>
        </div>
      </div>

      {/* Current Task */}
      {currentTask ? (
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${currentSubject?.color || '#5E6AD2'} 0%, ${currentSubject?.color || '#5E6AD2'}CC 100%)`,
          }}
        >
          <div className="absolute top-3 right-3 text-xs font-semibold bg-white/20 px-2 py-1 rounded">
            NOW
          </div>
          <div className="text-xs text-white/70 uppercase tracking-wider mb-2">
            Currently Working On
          </div>
          <div className="text-xl font-semibold text-white mb-2">
            {currentTask.title}
          </div>
          <div className="text-sm text-white/80 mb-4">
            {currentSubject?.name || 'No Subject'} • {currentTask.startTime} - {currentTask.endTime}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-white font-mono">
              {formatTimer(timerSeconds)}
            </div>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
              {isTimerRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={handleCompleteTask}
              className="bg-white text-accent-blue px-4 py-2 rounded-lg text-sm font-semibold ml-auto flex items-center gap-2 hover:bg-white/90 transition-colors"
              style={{ color: currentSubject?.color || '#5E6AD2' }}
            >
              <Check size={14} />
              Mark Complete
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-bg-secondary border border-bg-active rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <div className="text-lg font-semibold">All tasks completed!</div>
          <div className="text-sm text-text-muted mt-1">Great job on finishing everything today.</div>
        </div>
      )}

      {/* Task List */}
      <div className="bg-bg-secondary border border-bg-active rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-active">
          <span className="text-sm font-semibold">Today's Schedule</span>
          <span className="text-xs text-text-muted">{tasks.length + interviews.length} items</span>
        </div>

        <div className="divide-y divide-bg-active/50">
          {sortedTasks.map((task) => {
            const subject = subjects.find((s) => s.id === task.subjectId);
            const isCurrent = task.id === currentTask?.id;

            return (
              <div
                key={task.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                  task.completed ? 'opacity-50' : ''
                } ${isCurrent ? 'bg-accent-blue/5' : 'hover:bg-bg-tertiary/50'}`}
              >
                <div className="w-14 text-center flex-shrink-0">
                  <div className="text-sm font-semibold">{task.startTime?.slice(0, 5)}</div>
                  <div className="text-xs text-text-muted">{task.endTime?.slice(0, 5)}</div>
                </div>
                <div
                  className="w-0.5 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject?.color || '#5E6AD2' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${task.completed ? 'line-through text-text-muted' : ''}`}>
                      {task.title}
                    </span>
                    {isCurrent && (
                      <span className="text-xs bg-accent-blue text-white px-1.5 py-0.5 rounded font-medium">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">{subject?.name || 'No Subject'}</div>
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
          {interviews.map((interview) => {
            const job = jobs.find((j) => j.id === interview.jobId);
            return (
              <div
                key={interview.id}
                className="flex items-center gap-4 px-5 py-4 bg-accent-red/5"
              >
                <div className="w-14 text-center flex-shrink-0">
                  <div className="text-sm font-semibold">{interview.time?.slice(0, 5)}</div>
                  <div className="text-xs text-text-muted">60 min</div>
                </div>
                <div className="w-0.5 h-10 rounded-full bg-accent-red flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      🎤 {job?.company || 'Company'} - {interview.type}
                    </span>
                    <span className="text-xs bg-accent-red/20 text-accent-red px-1.5 py-0.5 rounded">
                      INTERVIEW
                    </span>
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">Technical Round</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
