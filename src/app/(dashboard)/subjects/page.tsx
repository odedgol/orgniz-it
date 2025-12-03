'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, ProgressBar, Modal, Input, Label } from '@/src/components/ui';
import { useAuthStore } from '@/src/stores/authStore';
import { useSubjectStore } from '@/src/stores/subjectStore';
import { useTaskStore } from '@/src/stores/taskStore';
import { SUBJECT_COLORS } from '@/src/types';
import type { Subject } from '@/src/types';

export default function SubjectsPage() {
  const { user } = useAuthStore();
  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjectStore();
  const { tasks } = useTaskStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState(SUBJECT_COLORS[0].value);
  const [goal, setGoal] = useState(5);
  const [topics, setTopics] = useState('');

  const openAddModal = () => {
    setEditingSubject(null);
    setName('');
    setColor(SUBJECT_COLORS[0].value);
    setGoal(5);
    setTopics('');
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setColor(subject.color);
    setGoal(subject.weeklyGoalTasks);
    setTopics(subject.topics.join(', '));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const topicList = topics
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingSubject) {
      await updateSubject(editingSubject.id, {
        name,
        color,
        weeklyGoalTasks: Number(goal),
        topics: topicList,
      });
    } else {
      await addSubject({
        userId: user.id,
        name,
        color,
        weeklyGoalTasks: Number(goal),
        topics: topicList,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (subjectId: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      await deleteSubject(subjectId);
    }
  };

  // Calculate weekly progress for each subject
  const getWeeklyProgress = (subjectId: string) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekTasks = tasks.filter((t) => {
      const taskDate = new Date(t.date);
      return t.subjectId === subjectId && taskDate >= startOfWeek && t.completed;
    });

    return weekTasks.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Subjects</h1>
          <p className="text-text-secondary mt-1">
            Track your learning goals and progress
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={16} className="mr-2" /> New Subject
        </Button>
      </div>

      {/* Subject Grid */}
      {subjects.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-text-tertiary mb-4">No subjects yet. Create one to get started!</p>
          <Button onClick={openAddModal}>
            <Plus size={16} className="mr-2" /> Create Subject
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {subjects.map((subject) => {
            const weeklyProgress = getWeeklyProgress(subject.id);

            return (
              <Card
                key={subject.id}
                className="group hover:border-accent-blue/50 transition-colors relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <h3 className="text-lg font-bold">{subject.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(subject)}
                      className="text-text-tertiary hover:text-text-primary transition-colors p-1"
                      title="Edit Subject"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="text-text-tertiary hover:text-accent-red transition-colors p-1"
                      title="Delete Subject"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-text-secondary">Weekly Goal</span>
                      <span className="text-text-primary font-medium">
                        {Math.min(weeklyProgress, subject.weeklyGoalTasks)} /{' '}
                        {subject.weeklyGoalTasks} tasks
                      </span>
                    </div>
                    <ProgressBar
                      current={weeklyProgress}
                      total={subject.weeklyGoalTasks}
                      color={subject.color}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {subject.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 rounded bg-bg-tertiary text-text-secondary text-xs border border-bg-active"
                      >
                        {topic}
                      </span>
                    ))}
                    {subject.topics.length === 0 && (
                      <span className="text-text-muted text-xs">No topics added</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'New Subject'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Algorithms"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c.value
                        ? 'ring-2 ring-offset-2 ring-offset-bg-primary ring-white'
                        : ''
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="goal">Weekly Task Goal</Label>
              <Input
                type="number"
                id="goal"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                min={1}
                max={50}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="topics">Topics (comma separated)</Label>
            <Input
              id="topics"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. Binary Search, DP, Graphs"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
