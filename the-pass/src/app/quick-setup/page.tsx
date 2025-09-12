'use client';

import { useState } from 'react';

export default function QuickSetup() {
  const [status, setStatus] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Database Setup Required
          </h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                🚀 Quick Setup Instructions
              </h2>
              <ol className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Open <a href="https://xedpssqxgmnwufatyoje.supabase.co" target="_blank" className="text-blue-600 hover:underline font-medium">Supabase Dashboard</a></span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Navigate to <strong>SQL Editor</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Copy the SQL script from <code className="bg-blue-100 px-1 rounded">setup-database.sql</code></span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  <span>Paste and <strong>Run</strong> the SQL script</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">5.</span>
                  <span>Return here and try creating workflows again</span>
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                ⚠️ Current Issue
              </h3>
              <p className="text-sm text-yellow-800">
                The workflow system needs the correct database tables (employees, checklists, workflows, task_instances) 
                to match the existing API structure. The previous setup used different table names that don't work 
                with the production system.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                ✅ What You'll Get After Setup
              </h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• <strong>6 Complete Jayna Gyro Workflows</strong></li>
                <li>• <strong>51 Real Restaurant Tasks</strong></li>
                <li>• FOH Opening/Closing, Kitchen Prep, Bar Duties</li>
                <li>• Inventory Management, Cleaning Protocols</li>
                <li>• Ready for actual restaurant operations</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
            <p className="text-sm text-gray-700">
              Once you run the SQL script, the workflow creation will work properly and you'll be able to 
              see and manage real Jayna Gyro tasks in "My Tasks". No more temporary workarounds needed!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}