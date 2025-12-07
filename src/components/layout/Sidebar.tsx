'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  BookOpen,
  Briefcase,
  BarChart2,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { useJobStore } from '@/stores/jobStore';
import { ProgressBar } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  count?: number;
  badge?: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, count, badge }) => {
  const pathname = usePathname();
  const { close, isMobile } = useSidebar();
  const isActive = pathname === href;

  const handleClick = () => {
    // Close sidebar on mobile when navigating
    if (isMobile) {
      close();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`group flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition-colors ${
        isActive
          ? 'bg-bg-tertiary text-text-primary'
          : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="opacity-70 group-hover:opacity-100" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-xs bg-bg-hover text-text-secondary px-1.5 py-0.5 rounded">
          {count}
        </span>
      )}
      {badge && <span className="text-xs text-accent-orange font-medium">{badge}</span>}
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const { tasks } = useTaskStore();
  const { jobs } = useJobStore();
  const { isOpen, isMobile, close } = useSidebar();

  const today = formatDate(new Date());
  const todayTasks = tasks.filter((t) => t.date === today);
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const activeJobs = jobs.filter(
    (j) => j.status === 'applied' || j.status === 'screening' || j.status === 'interview'
  ).length;

  // Close sidebar when pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && isOpen) {
        close();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobile, isOpen, close]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="mb-8 px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold">
              O
            </div>
            <h1 className="text-lg font-bold tracking-tight text-text-primary">Orgniz-it</h1>
          </div>
          {/* Close button - mobile only */}
          {isMobile && (
            <button
              onClick={close}
              className="p-2 -mr-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <p className="text-text-tertiary text-xs pl-11">Job Search OS</p>
      </div>

      {/* Navigation */}
      <div className="space-y-6 flex-1">
        <div>
          <h3 className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2 px-3">
            Views
          </h3>
          <NavItem
            href="/"
            icon={LayoutDashboard}
            label="Today"
            badge={user?.streak?.current ? `${user.streak.current}` : undefined}
          />
          <NavItem href="/day" icon={Calendar} label="Day View" />
          <NavItem href="/month" icon={CalendarDays} label="Month View" />
        </div>

        <div>
          <h3 className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2 px-3">
            Manage
          </h3>
          <NavItem href="/subjects" icon={BookOpen} label="Subjects" />
          <NavItem href="/jobs" icon={Briefcase} label="Jobs" count={activeJobs} />
          <NavItem href="/stats" icon={BarChart2} label="Stats" />
          <NavItem href="/settings" icon={Settings} label="Settings" />
        </div>
      </div>

      {/* Daily Goal Card */}
      <div className="space-y-4">
        <div className="bg-bg-secondary rounded-xl p-4 border border-bg-active">
          <p className="text-text-primary text-sm font-medium mb-1">Daily Goal</p>
          <p className="text-text-secondary text-xs mb-3">
            {completedToday} of {todayTasks.length || 5} tasks completed
          </p>
          <ProgressBar
            current={completedToday}
            total={todayTasks.length || 5}
            color="#3DCC79"
          />
        </div>

        {/* User & Sign Out */}
        {user && (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-sm font-medium">
                {user.displayName?.charAt(0) || 'U'}
              </div>
              <span className="text-sm text-text-secondary truncate max-w-[120px]">
                {user.displayName}
              </span>
            </div>
            <button
              onClick={signOut}
              className="text-text-tertiary hover:text-text-primary transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );

  // Desktop: Fixed sidebar
  if (!isMobile) {
    return (
      <div className="w-64 h-screen bg-bg-primary border-r border-bg-tertiary flex flex-col p-4 fixed left-0 top-0">
        {sidebarContent}
      </div>
    );
  }

  // Mobile: Slide-in drawer with overlay
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-full w-72 bg-bg-primary border-r border-bg-tertiary flex flex-col p-4 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
