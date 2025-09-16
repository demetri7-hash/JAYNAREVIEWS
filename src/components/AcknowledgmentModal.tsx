'use client';

import React, { useState } from 'react';
import { AlertTriangle, FileText, Shield, Bell, X } from 'lucide-react';

interface ManagerUpdate {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'announcement' | 'alert' | 'policy' | 'emergency';
  created_at: string;
}

interface AcknowledgmentModalProps {
  update: ManagerUpdate;
  userFullName: string;
  onAcknowledge: (updateId: string, fullNameEntered: string) => Promise<boolean>;
  onClose?: () => void;
}

export default function AcknowledgmentModal({ 
  update, 
  userFullName, 
  onAcknowledge,
  onClose 
}: AcknowledgmentModalProps) {
  const [fullNameInput, setFullNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const getIcon = () => {
    switch (update.type) {
      case 'policy': return <Shield className="w-8 h-8" />;
      case 'emergency': return <AlertTriangle className="w-8 h-8" />;
      case 'alert': return <Bell className="w-8 h-8" />;
      default: return <FileText className="w-8 h-8" />;
    }
  };

  const getPriorityColors = () => {
    switch (update.priority) {
      case 'critical': return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        icon: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700',
        header: 'bg-red-600'
      };
      case 'high': return {
        bg: 'bg-orange-50',
        border: 'border-orange-300', 
        icon: 'text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700',
        header: 'bg-orange-600'
      };
      case 'medium': return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        icon: 'text-yellow-600', 
        button: 'bg-yellow-600 hover:bg-yellow-700',
        header: 'bg-yellow-600'
      };
      default: return {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        header: 'bg-blue-600'
      };
    }
  };

  const colors = getPriorityColors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullNameInput.trim()) {
      setError('Please enter your full name to continue.');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmAcknowledgment = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const success = await onAcknowledge(update.id, fullNameInput.trim());
      if (success) {
        // Close modal on successful acknowledgment
        if (onClose) onClose();
      } else {
        setError('Failed to record acknowledgment. Please try again.');
        setShowConfirmation(false);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cannotClose = update.priority === 'critical' || update.type === 'emergency';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`max-w-2xl w-full ${colors.bg} ${colors.border} border-2 rounded-lg shadow-2xl animate-pulse-slow`}>
        {/* Header */}
        <div className={`${colors.header} text-white p-4 rounded-t-lg flex items-center justify-between`}>
          <div className="flex items-center">
            <div className="text-white mr-3">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold">MANDATORY ACKNOWLEDGMENT REQUIRED</h2>
              <p className="text-white opacity-90 text-sm">
                {update.priority.toUpperCase()} {update.type.toUpperCase()}
              </p>
            </div>
          </div>
          {!cannotClose && onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{update.title}</h3>
            <div className="bg-white p-4 rounded border text-gray-700 leading-relaxed">
              {update.message}
            </div>
          </div>

          {!showConfirmation ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  To acknowledge this update, please type your full name exactly as it appears in your profile:
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  placeholder={`Expected: ${userFullName}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  autoComplete="off"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  This creates a legal record of your acknowledgment.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!fullNameInput.trim()}
                  className={`flex-1 ${colors.button} text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  I Acknowledge and Understand
                </button>
                {!cannotClose && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Confirm Your Acknowledgment</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      You are about to acknowledge: <strong>&ldquo;{update.title}&rdquo;</strong>
                    </p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Signed as: <strong>{fullNameInput}</strong>
                    </p>
                    <p className="text-yellow-600 text-xs mt-2">
                      This action will be recorded with your IP address and timestamp for audit purposes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmAcknowledgment}
                  disabled={isSubmitting}
                  className={`flex-1 ${colors.button} text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 transition-colors`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      Recording Acknowledgment...
                    </>
                  ) : (
                    'CONFIRM ACKNOWLEDGMENT'
                  )}
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSubmitting}
                  className="px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 text-center">
            Created on {new Date(update.created_at).toLocaleString()} • 
            You must acknowledge this to continue using the application
          </div>
        </div>
      </div>
    </div>
  );
}