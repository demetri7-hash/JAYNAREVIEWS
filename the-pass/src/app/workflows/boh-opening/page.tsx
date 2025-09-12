import React from 'react'
import { useTranslation } from '@/context/TranslationContext'
import BackButton from '@/components/ui/BackButton'

export default function BOHOpeningPage() {
  const { t } = useTranslation()

  const checklistItems = [
    { id: 1, text: "Turn on all kitchen equipment", completed: false },
    { id: 2, text: "Check fryer oil levels and quality", completed: false },
    { id: 3, text: "Preheat grills and flat tops", completed: false },
    { id: 4, text: "Check refrigerator and freezer temperatures", completed: false },
    { id: 5, text: "Stock prep ingredients and spices", completed: false },
    { id: 6, text: "Sanitize all prep surfaces and utensils", completed: false },
    { id: 7, text: "Check inventory levels for the day", completed: false },
    { id: 8, text: "Set up prep stations", completed: false },
    { id: 9, text: "Check expiration dates on all products", completed: false },
    { id: 10, text: "Review prep list and special orders", completed: false },
    { id: 11, text: "Test all kitchen timers and equipment", completed: false },
    { id: 12, text: "Ensure proper hand washing stations are stocked", completed: false }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <BackButton href="/workflows" />
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('workflows.bohOpening')}
            </h1>
            <p className="mt-2 text-gray-600">
              Complete all opening tasks for Back of House kitchen operations
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
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
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
                  className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
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
            <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
              {t('actions.complete')} {t('workflows.openingChecklist')}
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              {t('actions.save')} {t('workflows.inProgress')}
            </button>
          </div>
        </div>

        {/* Temperature Log */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Temperature Log
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Walk-in Cooler (°F)
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="38°F"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Walk-in Freezer (°F)
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0°F"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep Cooler (°F)
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="38°F"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fryer Oil Temp (°F)
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="350°F"
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('reviews.notes')}
          </h3>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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