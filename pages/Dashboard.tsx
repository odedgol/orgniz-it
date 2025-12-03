import React, { useState } from 'react';
import { useStore } from '../store';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Check, Plus, MoreHorizontal, Flame, Briefcase, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/Components';

const Dashboard = () => {
  const { tasks, subjects, jobs, user, toggleTask, addTask } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const todaysTasks = tasks.filter(t => isSameDay(new Date(t.date), today)).sort((a, b) => a.order - b.order);
  const completedToday = todaysTasks.filter(t => t.completed).length;
  
  const activeApps = jobs.filter(j => ['applied', 'screening', 'interview'].includes(j.status)).length;
  const interviews = jobs.filter(j => j.status === 'interview').length;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    // Default to first subject if none selected (simplified for dashboard quick add)
    addTask({
      title: newTaskTitle,
      subjectId: subjects[0]?.id || 'misc',
      date: format(today, 'yyyy-MM-dd'),
    });
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">Good morning, {user.name}! 👋</h1>
          <p className="text-[#A1A1A6]">
            {format(today, 'EEEE, MMMM d')} • <span className="text-[#F59E0B] font-medium">🔥 {user.streak} day streak</span>
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" size="sm">Add Subject</Button>
            <Button size="sm" onClick={() => document.getElementById('quick-add')?.focus()}>+ New Task</Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 bg-gradient-to-br from-[#141416] to-[#1C1C1F]">
            <div className="p-3 rounded-lg bg-[#5E6AD2]/10 text-[#5E6AD2]">
                <CheckCircle2 size={24} />
            </div>
            <div>
                <p className="text-[#A1A1A6] text-xs font-medium uppercase tracking-wide">Tasks</p>
                <p className="text-2xl font-bold">{completedToday}/{todaysTasks.length}</p>
            </div>
        </Card>
        <Card className="flex items-center gap-4 bg-gradient-to-br from-[#141416] to-[#1C1C1F]">
            <div className="p-3 rounded-lg bg-[#3DCC79]/10 text-[#3DCC79]">
                <Briefcase size={24} />
            </div>
            <div>
                <p className="text-[#A1A1A6] text-xs font-medium uppercase tracking-wide">Active Apps</p>
                <p className="text-2xl font-bold">{activeApps}</p>
            </div>
        </Card>
        <Card className="flex items-center gap-4 bg-gradient-to-br from-[#141416] to-[#1C1C1F]">
            <div className="p-3 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
                <Calendar size={24} />
            </div>
            <div>
                <p className="text-[#A1A1A6] text-xs font-medium uppercase tracking-wide">Interviews</p>
                <p className="text-2xl font-bold">{interviews}</p>
            </div>
        </Card>
         <Card className="flex items-center gap-4 bg-gradient-to-br from-[#141416] to-[#1C1C1F]">
            <div className="p-3 rounded-lg bg-[#EF4444]/10 text-[#EF4444]">
                <Flame size={24} />
            </div>
            <div>
                <p className="text-[#A1A1A6] text-xs font-medium uppercase tracking-wide">Streak</p>
                <p className="text-2xl font-bold">{user.streak} Days</p>
            </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-8">
        {/* Task List */}
        <div className="col-span-2 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                Today's Focus
                <span className="text-xs text-[#6B6B70] font-normal border border-[#2A2A30] px-1.5 py-0.5 rounded">Press N to add</span>
            </h2>
            
            <Card className="overflow-hidden min-h-[400px] flex flex-col">
                <div className="divide-y divide-[#2A2A30]">
                    {todaysTasks.map(task => {
                        const subject = subjects.find(s => s.id === task.subjectId);
                        return (
                            <div key={task.id} className="group flex items-center gap-3 p-4 hover:bg-[#1C1C1F] transition-colors">
                                <button 
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                        task.completed 
                                            ? 'bg-[#3DCC79] border-[#3DCC79] text-[#0A0A0B]' 
                                            : 'border-[#4A4A4F] hover:border-[#FAFAFA]'
                                    }`}
                                >
                                    {task.completed && <Check size={12} strokeWidth={4} />}
                                </button>
                                <span className={`flex-1 text-sm ${task.completed ? 'text-[#6B6B70] line-through' : 'text-[#FAFAFA]'}`}>
                                    {task.title}
                                </span>
                                {subject && (
                                    <Badge color={subject.color}>{subject.name}</Badge>
                                )}
                                <button className="opacity-0 group-hover:opacity-100 text-[#6B6B70] hover:text-[#FAFAFA] transition-opacity">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
                
                {/* Quick Add */}
                <form onSubmit={handleAddTask} className="p-4 mt-auto border-t border-[#2A2A30]">
                    <div className="flex items-center gap-3 text-[#A1A1A6]">
                        <Plus size={20} />
                        <input
                            id="quick-add"
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Add a task..."
                            className="bg-transparent border-none focus:outline-none flex-1 text-sm text-[#FAFAFA] placeholder-[#4A4A4F]"
                        />
                        <span className="text-xs border border-[#2A2A30] px-1.5 rounded text-[#4A4A4F]">↵</span>
                    </div>
                </form>
            </Card>
        </div>

        {/* Right Column: Week Calendar & Upcoming */}
        <div className="space-y-6">
            <Card>
                <h3 className="text-sm font-semibold mb-4 px-2">This Week</h3>
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map(day => {
                        const isToday = isSameDay(day, today);
                        const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), day));
                        const allDone = dayTasks.length > 0 && dayTasks.every(t => t.completed);
                        
                        return (
                            <div key={day.toString()} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-[#1C1C1F] transition-colors cursor-pointer">
                                <span className={`text-xs ${isToday ? 'text-[#5E6AD2] font-bold' : 'text-[#6B6B70]'}`}>
                                    {format(day, 'EEE')}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    isToday 
                                        ? 'bg-[#5E6AD2] text-white' 
                                        : 'bg-[#1C1C1F] text-[#FAFAFA]'
                                }`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="h-1 w-1 rounded-full bg-[#3DCC79] opacity-0"></div> 
                                {/* Dot logic: shows if tasks completed */}
                                {allDone && <div className="h-1.5 w-1.5 rounded-full bg-[#3DCC79] -mt-2"></div>}
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Card className="p-5 border-[#5E6AD2]/20 bg-gradient-to-b from-[#141416] to-[#5E6AD2]/5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
                    Upcoming Interview
                </h3>
                <div className="space-y-1">
                    <p className="text-base font-bold text-[#FAFAFA]">Vercel</p>
                    <p className="text-sm text-[#A1A1A6]">Phone Screen</p>
                    <p className="text-xs text-[#5E6AD2] mt-2 font-medium">Tomorrow, 2:00 PM</p>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
