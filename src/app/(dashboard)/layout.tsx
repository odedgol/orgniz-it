'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/layout';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useInterviewReminders } from '@/hooks/useInterviewReminders';
import { useDockBadge } from '@/hooks/useDockBadge';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

// Mobile header component
const MobileHeader: React.FC = () => {
  const { toggle, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-bg-primary border-b border-bg-tertiary flex items-center px-4 z-30">
      <button
        onClick={toggle}
        className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>
      <div className="flex items-center gap-2 ml-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-sm">
          O
        </div>
        <h1 className="text-base font-bold tracking-tight text-text-primary">Orgniz-it</h1>
      </div>
    </header>
  );
};

// Main content wrapper
const MainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isMobile } = useSidebar();

  return (
    <main
      className={`flex-1 overflow-y-auto h-screen ${
        isMobile
          ? 'pt-14 p-4' // Mobile: top padding for header + small padding
          : 'ml-64 p-8' // Desktop: left margin for sidebar + larger padding
      }`}
    >
      <div className="max-w-6xl mx-auto pb-12">{children}</div>
    </main>
  );
};

// Dashboard content
const DashboardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Update dock badge with today's incomplete tasks count (Electron only)
  useDockBadge();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold animate-pulse">
            O
          </div>
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      <MobileHeader />
      <Sidebar />
      <MainContent>{children}</MainContent>
    </div>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
