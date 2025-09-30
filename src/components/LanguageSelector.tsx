import React from 'react';
import { useLanguage } from './LanguageProvider';

const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français'
};

const languageFlags: Record<string, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷'
};

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  return (
    <div className="relative inline-block">
      <select
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Select language"
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {languageFlags[lang]} {languageNames[lang]}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector;