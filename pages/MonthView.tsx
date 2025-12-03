import React from 'react';
import { useStore } from '../store';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Card } from '../components/ui/Components';

const MonthView = () => {
  const { tasks, interviews } = useStore();
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="h-full flex flex-col space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Month View</h1>
            <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#5E6AD2]"></div><span className="text-xs text-[#A1A1A6]">Task</span></div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div><span className="text-xs text-[#A1A1A6]">Interview</span></div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3DCC79]"></div><span className="text-xs text-[#A1A1A6]">Done</span></div>
                </div>
                <div className="flex items-center gap-4 bg-[#141416] border border-[#2A2A30] rounded-lg p-1">
                    <Button variant="ghost" size="sm"><ChevronLeft size={16} /></Button>
                    <span className="text-sm font-medium w-32 text-center">{format(today, 'MMMM yyyy')}</span>
                    <Button variant="ghost" size="sm"><ChevronRight size={16} /></Button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-[#2A2A30] border border-[#2A2A30] rounded-xl overflow-hidden shadow-2xl">
            {/* Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-[#0A0A0B] p-3 text-center text-xs font-semibold text-[#6B6B70] uppercase tracking-wider">
                    {day}
                </div>
            ))}

            {/* Days */}
            {days.map(day => {
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isSameDay(day, today);
                const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), day));
                const dayInterviews = interviews.filter(i => isSameDay(new Date(i.date), day));
                const completed = dayTasks.filter(t => t.completed).length;

                return (
                    <div 
                        key={day.toString()} 
                        className={`bg-[#141416] min-h-[120px] p-2 hover:bg-[#1C1C1F] transition-colors relative flex flex-col gap-1 ${!isCurrentMonth ? 'opacity-30' : ''}`}
                    >
                        <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                            isTodayDate 
                                ? 'bg-[#5E6AD2] text-white' 
                                : 'text-[#A1A1A6]'
                        }`}>
                            {format(day, 'd')}
                        </span>

                        {/* Event Dots */}
                        <div className="flex-1 flex flex-col gap-1">
                            {dayInterviews.map((int, idx) => (
                                <div key={idx} className="bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] px-1.5 py-0.5 rounded truncate font-medium border-l-2 border-[#F59E0B]">
                                    {int.time} {int.type}
                                </div>
                            ))}
                            
                            {dayTasks.length > 0 && (
                                <div className="mt-auto flex items-center justify-between px-1">
                                    <div className="flex -space-x-1">
                                        {dayTasks.slice(0, 3).map(t => (
                                            <div key={t.id} className={`w-1.5 h-1.5 rounded-full ring-1 ring-[#141416] ${t.completed ? 'bg-[#3DCC79]' : 'bg-[#5E6AD2]'}`} />
                                        ))}
                                        {dayTasks.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-[#6B6B70] ring-1 ring-[#141416]" />}
                                    </div>
                                    {completed === dayTasks.length && (
                                        <span className="text-[10px] text-[#3DCC79]">🔥</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default MonthView;
