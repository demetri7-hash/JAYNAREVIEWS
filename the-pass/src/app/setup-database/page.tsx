'use client';

import { useState } from 'react';

export default function DatabaseSetup() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const setupDatabase = async () => {
    setIsLoading(true);
    setStatus('Setting up database tables...');

    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setStatus('✅ Database setup completed successfully!');
      } else {
        setStatus(`❌ Setup failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setStatus(`❌ Setup failed: ${error instanceof Error ? error.message : 'Network error'}`);
    }
    
    setIsLoading(false);
  };

  const createWorkflows = async () => {
    setIsLoading(true);
    setStatus('Creating Jayna Gyro workflows...');

    try {
      const response = await fetch('/api/create-jayna-workflows', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setStatus(`✅ Successfully created workflows! ${result.message}`);
      } else {
        setStatus(`❌ Workflow creation failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setStatus(`❌ Workflow creation failed: ${error instanceof Error ? error.message : 'Network error'}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Database Setup
          </h1>
          
          <div className="space-y-4">
            <button
              onClick={setupDatabase}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Setting up...' : 'Step 1: Setup Database Tables'}
            </button>
            
            <button
              onClick={createWorkflows}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Step 2: Create Jayna Gyro Workflows'}
            </button>
          </div>

          {status && (
            <div className="mt-6 p-4 rounded-md bg-gray-50">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{status}</p>
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500">
            <p className="mb-2"><strong>Manual Setup Option:</strong></p>
            <p>1. Go to <a href="https://xedpssqxgmnwufatyoje.supabase.co" target="_blank" className="text-blue-600 hover:underline">Supabase Dashboard</a></p>
            <p>2. Navigate to SQL Editor</p>
            <p>3. Copy contents of <code>setup-database.sql</code></p>
            <p>4. Run the SQL script</p>
          </div>
        </div>
      </div>
    </div>
  );
}