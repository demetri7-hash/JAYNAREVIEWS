'use client'

import React, { useState } from 'react'
import { Camera, CheckCircle2, Upload, FileText, Clock } from 'lucide-react'
import Checklist from '@/components/Tasks/Checklist'

// Demo workflow and instance data
const DEMO_TEMPLATE = {
  id: 'c039dc69-e039-4ba8-81c4-6d43a7e6abb1',
  name: 'FOH Opening Checklist',
  description: 'Complete all front-of-house opening procedures'
}

const DEMO_INSTANCE = {
  id: 'instance-' + Date.now(),
  templateId: DEMO_TEMPLATE.id,
  startedAt: new Date().toISOString()
}

export default function TaskPhotoDemo() {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null)

  const handleStartChecklist = () => {
    setActiveWorkflow(DEMO_INSTANCE.id)
  }

  const handleChecklistComplete = () => {
    alert('Checklist completed! All required tasks finished.')
    setActiveWorkflow(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📱 Task Photo Integration Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete tasks with photo uploads and notes. Experience seamless integration 
            between checklist workflows and photo documentation.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center space-x-3 mb-3">
              <Camera className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-semibold">Photo Capture</h3>
            </div>
            <p className="text-gray-600">
              Take photos directly within tasks or upload from device. 
              Required photos block task completion.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="w-8 h-8 text-green-500" />
              <h3 className="text-lg font-semibold">Smart Notes</h3>
            </div>
            <p className="text-gray-600">
              Add detailed notes to tasks. Auto-save as you type. 
              Required notes ensure quality documentation.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle2 className="w-8 h-8 text-purple-500" />
              <h3 className="text-lg font-semibold">Progress Tracking</h3>
            </div>
            <p className="text-gray-600">
              Real-time progress updates. Visual indicators for required vs optional tasks. 
              Complete visibility into workflow status.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Interactive Demo</h2>
          
          {!activeWorkflow ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {DEMO_TEMPLATE.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {DEMO_TEMPLATE.description}
                </p>
              </div>

              <button
                onClick={handleStartChecklist}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Start Demo Checklist
              </button>

              <div className="mt-6 text-sm text-gray-500">
                <p>This demo includes tasks with:</p>
                <div className="flex justify-center space-x-6 mt-2">
                  <span className="flex items-center">
                    <Camera className="w-4 h-4 mr-1" />
                    Photo Requirements
                  </span>
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Note Requirements
                  </span>
                  <span className="flex items-center">
                    <Upload className="w-4 h-4 mr-1" />
                    File Uploads
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <Checklist
              templateId={DEMO_TEMPLATE.id}
              instanceId={activeWorkflow}
              title={DEMO_TEMPLATE.name}
              description={DEMO_TEMPLATE.description}
              onComplete={handleChecklistComplete}
            />
          )}
        </div>

        {/* Technical Features */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">🛠️ Technical Implementation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Database Integration</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Task completions stored with photo URLs array</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Automatic task validation for required fields</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Real-time progress tracking and analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>User attribution and completion timestamps</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Photo System Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Camera capture with device camera API</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>File upload with drag & drop support</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Image validation and compression</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Supabase Storage integration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}