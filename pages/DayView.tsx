import React from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Components';

const DayView = () => {
  const { tasks, subjects } = useStore();
  const today = new Date();
  
  // Mock hours for the timeline
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

  return (
    <div className="h-full flex flex-col space-y-4">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Day View</h1>
            <div className="flex items-center gap-4 bg-[#141416] border border-[#2A2A30] rounded-lg p-1">
                <Button variant="ghost" size="sm"><ChevronLeft size={16} /></Button>
                <span className="text-sm font-medium px-2">{format(today, 'EEEE, MMMM d, yyyy')}</span>
                <Button variant="ghost" size="sm"><ChevronRight size={16} /></Button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-[#2A2A30] bg-[#141416] relative">
            {hours.map(hour => (
                <div key={hour} className="group flex border-b border-[#2A2A30]/50 min-h-[80px]">
                    <div className="w-16 py-3 px-2 border-r border-[#2A2A30]/50 text-right">
                        <span className="text-xs text-[#6B6B70] font-medium">
                            {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                        </span>
                    </div>
                    <div className="flex-1 relative p-2 group-hover:bg-[#1C1C1F]/30 transition-colors">
                        {/* Mock Placement of tasks for visualization since tasks model doesn't have exact time yet */}
                        {hour === 9 && (
                            <div className="absolute top-2 left-2 right-4 bg-[#5E6AD2]/20 border-l-4 border-[#5E6AD2] p-2 rounded text-xs">
                                <span className="text-[#5E6AD2] font-bold block">LeetCode Practice</span>
                                <span className="text-[#A1A1A6]">9:00 AM - 10:30 AM</span>
                            </div>
                        )}
                         {hour === 14 && (
                            <div className="absolute top-2 left-2 right-4 bg-[#F59E0B]/20 border-l-4 border-[#F59E0B] p-2 rounded text-xs">
                                <span className="text-[#F59E0B] font-bold block">Vercel Interview Prep</span>
                                <span className="text-[#A1A1A6]">2:00 PM - 3:00 PM</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            {/* Current Time Indicator */}
            <div 
                className="absolute left-16 right-0 border-t border-red-500 z-10 flex items-center"
                style={{ top: '340px' }} // Mock position
            >
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
            </div>
        </div>
    </div>
  );
};

export default DayView;
