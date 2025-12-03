import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, ProgressBar, Modal, Input, Label } from '../components/ui/Components';
import { Plus, MoreVertical, Edit2 } from 'lucide-react';
import { Subject } from '../types';

const Subjects = () => {
  const { subjects, tasks, addSubject, updateSubject } = useStore();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#5E6AD2');
  const [goal, setGoal] = useState(5);
  const [topics, setTopics] = useState('');

  const openAddModal = () => {
    setEditingSubject(null);
    setName('');
    setColor('#5E6AD2');
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const topicList = topics.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        name,
        color,
        weeklyGoalTasks: Number(goal),
        topics: topicList
      });
    } else {
      addSubject({
        name,
        color,
        weeklyGoalTasks: Number(goal),
        topics: topicList
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-[#FAFAFA]">Subjects</h1>
            <p className="text-[#A1A1A6] mt-1">Track your learning goals and progress</p>
        </div>
        <Button onClick={openAddModal}>
            <Plus size={16} className="mr-2" /> New Subject
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {subjects.map(subject => {
            const subjectTasks = tasks.filter(t => t.subjectId === subject.id);
            const completed = subjectTasks.filter(t => t.completed).length;
            
            const weeklyProgress = Math.min(completed, subject.weeklyGoalTasks);
            
            return (
                <Card key={subject.id} className="group hover:border-[#5E6AD2]/50 transition-colors relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: subject.color }}></div>
                            <h3 className="text-lg font-bold">{subject.name}</h3>
                        </div>
                        <button 
                            onClick={() => openEditModal(subject)}
                            className="text-[#6B6B70] hover:text-[#FAFAFA] transition-colors p-1"
                            title="Edit Subject"
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-[#A1A1A6]">Weekly Goal</span>
                                <span className="text-[#FAFAFA] font-medium">{weeklyProgress} / {subject.weeklyGoalTasks} tasks</span>
                            </div>
                            <ProgressBar current={weeklyProgress} total={subject.weeklyGoalTasks} color={subject.color} />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {subject.topics.map(topic => (
                                <span key={topic} className="px-2 py-1 rounded bg-[#1C1C1F] text-[#A1A1A6] text-xs border border-[#2A2A30]">
                                    {topic}
                                </span>
                            ))}
                            <button 
                                onClick={() => openEditModal(subject)}
                                className="px-2 py-1 rounded border border-dashed border-[#4A4A4F] text-[#4A4A4F] text-xs hover:text-[#FAFAFA] hover:border-[#FAFAFA] transition-colors"
                            >
                                + Edit Topics
                            </button>
                        </div>
                    </div>
                </Card>
            );
        })}
      </div>

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
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Algorithms" 
                    required 
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2 items-center">
                        <input 
                            type="color" 
                            id="color" 
                            value={color} 
                            onChange={e => setColor(e.target.value)}
                            className="h-10 w-10 rounded border border-[#2A2A30] bg-[#141416] cursor-pointer" 
                        />
                        <Input 
                            value={color} 
                            onChange={e => setColor(e.target.value)} 
                            placeholder="#000000"
                            pattern="^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$"
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="goal">Weekly Task Goal</Label>
                    <Input 
                        type="number" 
                        id="goal" 
                        value={goal} 
                        onChange={e => setGoal(Number(e.target.value))} 
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
                    onChange={e => setTopics(e.target.value)} 
                    placeholder="e.g. Binary Search, DP, Graphs" 
                />
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">{editingSubject ? 'Save Changes' : 'Create Subject'}</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Subjects;