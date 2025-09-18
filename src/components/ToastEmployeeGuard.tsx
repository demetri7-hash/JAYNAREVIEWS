'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  toast_employee_id?: string;
  employee_status?: string;
}

interface ToastRequiredProps {
  children: React.ReactNode;
  requireToastLink?: boolean;
  fallback?: React.ReactNode;
}

export default function ToastEmployeeGuard({ 
  children, 
  requireToastLink = true,
  fallback 
}: ToastRequiredProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasToastLink, setHasToastLink] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setHasToastLink(!!data.user.toast_employee_id);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-ocean-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/');
    return null;
  }

  // If TOAST link is required but user doesn't have one
  if (requireToastLink && !hasToastLink) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Account Setup Required
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your account needs to be linked to a TOAST employee profile before you can access personalized features like tasks, schedules, and performance data.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next:</h3>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• A manager will link your account to your TOAST employee profile</li>
              <li>• Once linked, you'll have access to all personalized features</li>
              <li>• This is a one-time setup process</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Return to Dashboard
            </button>
            
            <button
              onClick={fetchUserProfile}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Check Status Again
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Account: {user?.name || session.user?.name}<br />
              {user?.email || session.user?.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user is archived
  if (user?.employee_status === 'archived') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🔒</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Account Archived
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your employee account has been archived and you no longer have access to the task management system.
          </p>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Return to Login
          </button>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              If you believe this is an error, please contact your manager.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}