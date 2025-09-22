'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole, isManagerRole } from '@/types';
import ManagerNavigation from '@/components/ManagerNavigation';
import { WorkflowManagementTab } from '@/components/WorkflowManagementTab';

export default function WorkflowManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleMessage = (msg: { type: 'success' | 'error'; text: string }) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 5000);
  };

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
          currentTool="workflows"
          title="Workflow Management"
          subtitle="Create and manage workflows for your team"
        />

        {/* Messages */}
        {message && (
          <div className={`${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          } px-4 py-3 rounded-xl mb-6`}>
            {message.text}
          </div>
        )}

        {/* Workflow Management Component */}
        <div className="animate-fade-in-up">
          <WorkflowManagementTab onMessage={handleMessage} />
        </div>
      </div>
    </div>
  );
}