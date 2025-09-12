'use client';

import { useState } from 'react';

export default function QuickSetup() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const setupEverything = async () => {
    setIsLoading(true);
    setStatus('Setting up Jayna Gyro workflows...\n');

    try {
      // Step 1: Create workflow templates
      setStatus(prev => prev + '📝 Creating workflow templates...\n');
      const createResponse = await fetch('/api/create-jayna-workflows', {
        method: 'POST',
      });
      
      const createResult = await createResponse.json();
      
      if (!createResponse.ok) {
        setStatus(prev => prev + `❌ Failed to create templates: ${createResult.error}\n`);
        setIsLoading(false);
        return;
      }
      
      setStatus(prev => prev + `✅ Created ${createResult.summary?.workflows_created || 0} workflow templates\n`);
      
      // Step 2: Auto-assign workflows to current user
      setStatus(prev => prev + '👤 Auto-assigning workflows to you...\n');
      
      // Get user email from session or use a default
      const userEmail = 'manager@jaynagyro.com'; // You can change this
      
      const assignResponse = await fetch('/api/workflows/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateIds: 'all', // Assign all templates
          assigneeEmail: userEmail,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Due tomorrow
        }),
      });
      
      if (assignResponse.ok) {
        setStatus(prev => prev + '✅ Workflows assigned successfully!\n');
      } else {
        setStatus(prev => prev + '⚠️ Templates created but assignment may need manual setup\n');
      }
      
      setStatus(prev => prev + '\n🎉 Setup complete! Go to "My Tasks" to see your workflows.');
      
    } catch (error) {
      setStatus(prev => prev + `❌ Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Setup
          </h1>
          
          <div className="space-y-4">
            <button
              onClick={setupEverything}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? '⏳ Setting up...' : '🚀 Create & Assign All Jayna Gyro Workflows'}
            </button>
          </div>

          {status && (
            <div className="mt-6 p-4 rounded-md bg-gray-50">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">{status}</pre>
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500">
            <p className="mb-2"><strong>This will:</strong></p>
            <ul className="space-y-1 ml-4">
              <li>• Create 6 Jayna Gyro workflow templates</li>
              <li>• Assign them all to you for immediate use</li>
              <li>• Set due dates for tomorrow</li>
              <li>• Make them appear in "My Tasks"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}