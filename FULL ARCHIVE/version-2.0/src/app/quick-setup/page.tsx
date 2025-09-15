'use client';

import { useState } from 'react';

export default function QuickSetup() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const setupEverything = async () => {
    setIsLoading(true);
    setStatus('🚀 Setting up Jayna Gyro workflows...\n');

    try {
      // Create workflow templates and instances
      setStatus(prev => prev + '📝 Creating workflow templates and instances...\n');
      const createResponse = await fetch('/api/create-jayna-workflows', {
        method: 'POST',
      });
      
      const createResult = await createResponse.json();
      
      if (!createResponse.ok) {
        setStatus(prev => prev + `❌ Failed to create workflows: ${createResult.error}\n`);
        if (createResult.hint) {
          setStatus(prev => prev + `💡 Hint: ${createResult.hint}\n`);
        }
        setIsLoading(false);
        return;
      }
      
      setStatus(prev => prev + `✅ Created ${createResult.summary?.workflows_created || 0} workflows with ${createResult.summary?.total_tasks || 0} tasks\n`);
      setStatus(prev => prev + '🎉 Setup complete! Go to "My Tasks" to see your workflows.\n\n');
      
      // Show summary
      if (createResult.results) {
        setStatus(prev => prev + '📋 Workflows created:\n');
        createResult.results.forEach((result: any) => {
          if (result.success) {
            setStatus(prev => prev + `  ✅ ${result.workflow} (${result.tasks} tasks)\n`);
          } else {
            setStatus(prev => prev + `  ❌ ${result.workflow}: ${result.error}\n`);
          }
        });
      }
      
    } catch (error) {
      setStatus(prev => prev + `❌ Setup failed: ${error instanceof Error ? error.message : 'Network error'}\n`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Jayna Gyro Quick Setup
          </h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                🚀 Two-Step Setup Process
              </h2>
              <ol className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>First, run the database setup in <a href="https://xedpssqxgmnwufatyoje.supabase.co" target="_blank" className="text-blue-600 hover:underline font-medium">Supabase SQL Editor</a> with the <code className="bg-blue-100 px-1 rounded">setup-database.sql</code> script</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Then click the button below to create and assign Jayna Gyro workflows</span>
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <button
                onClick={setupEverything}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? '⏳ Creating workflows...' : '🎯 Create & Assign Jayna Gyro Workflows'}
              </button>
            </div>

            {status && (
              <div className="mt-6 p-4 rounded-md bg-gray-50">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">{status}</pre>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                ✅ What You'll Get After Setup
              </h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• <strong>6 Complete Jayna Gyro Workflows</strong></li>
                <li>• <strong>51+ Real Restaurant Tasks</strong></li>
                <li>• FOH Opening/Closing, Kitchen Prep, Bar Duties</li>
                <li>• Inventory Management, Cleaning Protocols</li>
                <li>• Ready for actual restaurant operations</li>
                <li>• Assigned to manager@jaynagyro.com for immediate use</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}