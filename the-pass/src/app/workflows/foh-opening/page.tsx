import React from 'react'
import { useTranslation } from '@/context/TranslationContext'
import BackButton from '@/components/ui/BackButton'

export default function FOHOpeningPage() {
  const { t } = useTranslation()

  const checklistItems = [
    { id: 1, text: "Unlock front doors and turn on lights", completed: false },
    { id: 2, text: "Turn on all equipment (fryers, grills, warmers)", completed: false },
    { id: 3, text: "Check temperatures on all equipment", completed: false },
    { id: 4, text: "Fill drink machines and check CO2 levels", completed: false },
    { id: 5, text: "Stock napkins, cups, and utensils", completed: false },
    { id: 6, text: "Clean and sanitize all surfaces", completed: false },
    { id: 7, text: "Check POS system and receipt printer", completed: false },
    { id: 8, text: "Count register till and record starting amount", completed: false },
    { id: 9, text: "Review daily specials and promotions", completed: false },
    { id: 10, text: "Check cleanliness of dining area", completed: false }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <BackButton href="/workflows" />
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('workflows.fohOpening')}
            </h1>
            <p className="mt-2 text-gray-600">
              Complete all opening tasks for Front of House operations
            </p>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('workflows.openingChecklist')}
            </h2>
            <span className="text-sm text-gray-500">
              0 of {checklistItems.length} {t('workflows.itemsCompleted')}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {/* Handle checkbox change */}}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="flex-1 text-gray-700 cursor-pointer">
                  {item.text}
                </label>
                <span className="text-xs text-gray-400">
                  {item.id.toString().padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {t('actions.complete')} {t('workflows.openingChecklist')}
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              {t('actions.save')} {t('workflows.inProgress')}
            </button>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('reviews.notes')}
          </h3>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('reviews.notesPlaceholder')}
          />
          <div className="mt-4 flex justify-end">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              {t('actions.save')} {t('reviews.notes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}