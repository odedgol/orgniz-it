import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, CalendarDays, BookOpen, Briefcase, BarChart2, Plus } from 'lucide-react';
import { useStore } from '../store';

const Sidebar = () => {
  const { user, tasks, jobs } = useStore();
  const todayCount = tasks.filter(t => !t.completed && t.date === new Date().toISOString().split('T')[0]).length;
  const activeJobs = jobs.filter(j => j.status === 'applied' || j.status === 'screening' || j.status === 'interview').length;

  const NavItem = ({ to, icon: Icon, label, count, badge }: { to: string; icon: any; label: string; count?: number; badge?: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `
        group flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition-colors
        ${isActive ? 'bg-[#1C1C1F] text-[#FAFAFA]' : 'text-[#A1A1A6] hover:bg-[#141416] hover:text-[#FAFAFA]'}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="opacity-70 group-hover:opacity-100" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-xs bg-[#232328] text-[#A1A1A6] px-1.5 py-0.5 rounded">{count}</span>
      )}
      {badge && (
        <span className="text-xs text-[#F59E0B] font-medium">{badge}</span>
      )}
    </NavLink>
  );

  return (
    <div className="w-64 h-screen bg-[#0A0A0B] border-r border-[#1C1C1F] flex flex-col p-4 fixed left-0 top-0">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5E6AD2] to-[#9F7AEA] flex items-center justify-center text-white font-bold">O</div>
            <h1 className="text-lg font-bold tracking-tight text-[#FAFAFA]">Orgniz-it</h1>
        </div>
        <p className="text-[#6B6B70] text-xs pl-11">Job Search OS</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-[#4A4A4F] text-xs font-semibold uppercase tracking-wider mb-2 px-3">Views</h3>
          <NavItem to="/" icon={LayoutDashboard} label="Today" badge={`🔥 ${user.streak}`} />
          <NavItem to="/day" icon={Calendar} label="Day View" />
          <NavItem to="/month" icon={CalendarDays} label="Month View" />
        </div>

        <div>
          <h3 className="text-[#4A4A4F] text-xs font-semibold uppercase tracking-wider mb-2 px-3">Manage</h3>
          <NavItem to="/subjects" icon={BookOpen} label="Subjects" />
          <NavItem to="/jobs" icon={Briefcase} label="Jobs" count={activeJobs} />
          <NavItem to="/stats" icon={BarChart2} label="Stats" />
        </div>
      </div>

      <div className="mt-auto">
        <div className="bg-[#141416] rounded-xl p-4 border border-[#2A2A30]">
            <p className="text-[#FAFAFA] text-sm font-medium mb-1">Daily Goal</p>
            <p className="text-[#A1A1A6] text-xs mb-3">2 of 5 tasks completed</p>
            <div className="h-1.5 w-full bg-[#1C1C1F] rounded-full overflow-hidden">
                <div className="h-full bg-[#3DCC79] w-[40%]"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
