'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UsersIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

interface ImportResult {
  success: boolean;
  workflow?: string;
  tasks?: number;
  roles?: string[];
  error?: string;
}

interface ImportResponse {
  success: boolean;
  message: string;
  results: ImportResult[];
  summary: {
    workflows_imported: number;
    total_tasks: number;
    languages: string[];
    departments: string[];
  };
}

export default function ImportWorkflows() {
  const { data: session } = useSession();
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setError(null);
    setImportResults(null);

    try {
      const response = await fetch('/api/import-jayna-workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-pass-accent" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Import Jayna Gyro Workflows
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Convert reference worksheets into digital workflow templates
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📋 What will be imported:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <BuildingOffice2Icon className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-700">Front of House workflows</span>
            </div>
            <div className="flex items-center space-x-3">
              <UsersIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-700">Back of House workflows</span>
            </div>
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-700">Daily prep schedules</span>
            </div>
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-700">Inventory checklists</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-700">Cleaning protocols</span>
            </div>
            <div className="flex items-center space-x-3">
              <CloudArrowUpIcon className="h-5 w-5 text-indigo-500" />
              <span className="text-sm text-gray-700">Bar closing procedures</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-900 mb-2">Multi-language Support:</h3>
            <div className="flex space-x-4 text-sm text-blue-700">
              <span>🇺🇸 English</span>
              <span>🇪🇸 Spanish</span>
              <span>🇹🇷 Turkish</span>
            </div>
          </div>
        </div>

        {/* Import Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleImport}
            disabled={isImporting}
            className={`
              inline-flex items-center px-6 py-3 border border-transparent 
              text-base font-medium rounded-md text-white
              ${isImporting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-pass-accent hover:bg-pass-accent-dark focus:ring-2 focus:ring-pass-accent'
              }
              transition-colors duration-200
            `}
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Importing Workflows...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Import All Jayna Gyro Workflows
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Import Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {importResults && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">
                Import Complete!
              </h2>
            </div>

            {/* Summary */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <h3 className="font-medium text-green-900 mb-2">{importResults.message}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-700">
                <div>
                  <span className="font-medium">{importResults.summary.workflows_imported}</span>
                  <div>Workflows</div>
                </div>
                <div>
                  <span className="font-medium">{importResults.summary.total_tasks}</span>
                  <div>Tasks</div>
                </div>
                <div>
                  <span className="font-medium">{importResults.summary.languages.length}</span>
                  <div>Languages</div>
                </div>
                <div>
                  <span className="font-medium">{importResults.summary.departments.length}</span>
                  <div>Departments</div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Imported Workflows:</h3>
              {importResults.results.map((result, index) => (
                <div 
                  key={index}
                  className={`
                    flex items-center justify-between p-3 rounded-md
                    ${result.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                    }
                  `}
                >
                  <div className="flex items-center">
                    {result.success ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <div className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                        {result.workflow}
                      </div>
                      {result.success && (
                        <div className="text-sm text-green-700">
                          {result.tasks} tasks • Roles: {result.roles?.join(', ')}
                        </div>
                      )}
                      {!result.success && (
                        <div className="text-sm text-red-700">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">🎉 Ready to Use!</h3>
              <p className="text-sm text-blue-700">
                All Jayna Gyro workflows are now available in the system. Managers can assign them to employees, 
                and staff can start completing real restaurant tasks digitally!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}