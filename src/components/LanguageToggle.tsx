'use client';

import React from 'react';
import { useLanguage, languageFlags } from '@/contexts/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en' as const, name: 'English', flag: languageFlags.en },
    { code: 'es' as const, name: 'Español', flag: languageFlags.es },
    { code: 'tr' as const, name: 'Türkçe', flag: languageFlags.tr }
  ];

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'es' | 'tr')}
        className="appearance-none bg-white border border-gray-300 rounded-md px-8 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        style={{ 
          backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="#666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>')}")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '8px 10px'
        }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// Simple flag-only version for compact spaces
export const LanguageToggleCompact: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en' as const, flag: languageFlags.en },
    { code: 'es' as const, flag: languageFlags.es },
    { code: 'tr' as const, flag: languageFlags.tr }
  ];

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`text-2xl hover:scale-110 transition-transform ${
            language === lang.code ? 'opacity-100' : 'opacity-50 hover:opacity-75'
          }`}
          title={`Switch to ${lang.code.toUpperCase()}`}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
};