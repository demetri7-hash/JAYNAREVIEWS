'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole, isManagerRole } from '@/types';
import ManagerNavigation from '@/components/ManagerNavigation';
import TaskTransfersTab from '@/components/TaskTransfersTab';

export default function TaskTransfers() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userRole = session?.user?.role as UserRole;

  // Redirect if not a manager
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    
    if (status === 'authenticated' && userRole && !isManagerRole(userRole)) {
      router.push('/');
      return;
    }
  }, [session, status, userRole, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-ocean-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <ManagerNavigation 
          currentTool="task-transfers"
          title="Task Transfers"
          subtitle="Manage and track task transfers between shifts and team members"
        />

        {/* Task Transfers Component */}
        <div className="animate-fade-in-up">
          <TaskTransfersTab />
        </div>
      </div>
    </div>
  );
}