'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/types';
import { getLanguageFlag } from '@/lib/translations';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'tr', label: 'TR' }
  ];

  return (
    <div className="flex items-center space-x-1 bg-white rounded-lg shadow-sm border p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            language === lang.code
              ? 'bg-blue-100 text-blue-800'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <span className="text-lg">{getLanguageFlag(lang.code)}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
