'use client';

import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { Phone } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function Layout({ children, title, showBackButton = false, onBack }: LayoutProps) {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Title/Back */}
            <div className="flex items-center">
              {showBackButton && onBack && (
                <button
                  onClick={onBack}
                  className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  ←
                </button>
              )}
              <h1 className="text-xl font-semibold text-gray-900">
                {title || t('home.title', language)}
              </h1>
            </div>

            {/* Right side - Language switcher and emergency */}
            <div className="flex items-center space-x-4">
              <a 
                href="tel:916-513-3192"
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  {t('emergency.contact', language)}
                </span>
              </a>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 Jayna Gyro Employee App</p>
            <p className="mt-1">
              {new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'es' ? 'es-ES' : 'en-US')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
