'use client';

import { useLanguage, type SupportedLocale } from '../../contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'loading' | 'header' | 'compact' | 'loading-no-flag';
  className?: string;
}

export function LanguageSelector({ variant = 'loading', className = '' }: LanguageSelectorProps) {
  const { locale, changeLanguage, getLanguageFlag, getLanguageName, isClient } = useLanguage();

  if (!isClient) {
    return null;
  }

  const languages: SupportedLocale[] = ['es', 'en', 'ru', 'zh', 'th', 'fr'];

  if (variant === 'compact') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`
              relative px-2 py-1 font-mono text-xs tracking-wider transition-all duration-200
              border border-white flex items-center gap-1
              ${locale === lang 
                ? 'bg-white text-black' 
                : 'text-white hover:bg-white hover:text-black'
              }
            `}
            title={getLanguageName(lang)}
          >
            <span className="text-sm">{getLanguageFlag(lang)}</span>
            <span className="hidden sm:inline">{lang.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`
              relative px-3 py-2 font-mono text-sm tracking-wider transition-all duration-200
              border border-white flex items-center gap-2
              ${locale === lang 
                ? 'bg-white text-black' 
                : 'text-white hover:bg-white hover:text-black'
              }
            `}
          >
            <span className="text-lg">{getLanguageFlag(lang)}</span>
            <span>{getLanguageName(lang)}</span>
          </button>
        ))}
      </div>
    );
  }

  // Variant 'loading-no-flag' - botones sin banderas para el loading screen
  if (variant === 'loading-no-flag') {
    return (
      <div className={`flex gap-2 sm:gap-3 justify-center flex-wrap ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`
              group relative px-3 sm:px-4 py-1.5 sm:py-2 border border-white transition-all duration-300 cursor-pointer
              flex items-center justify-center min-w-[60px] sm:min-w-[80px] flex-1 sm:flex-none
              ${locale === lang 
                ? 'bg-white text-black' 
                : 'text-white hover:bg-white hover:text-black'
              }
            `}
          >
            <div className={`absolute -inset-1 border transition-colors duration-300 ${
              locale === lang ? 'border-gray-800' : 'border-gray-600 group-hover:border-white'
            }`}></div>
            <span className="relative font-mono text-xs tracking-wider">
              {getLanguageName(lang)}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Variant 'loading' - botones más grandes para el loading screen
  return (
    <div className={`flex gap-4 ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={`
            group relative px-6 py-3 border border-white transition-all duration-300 cursor-pointer
            flex items-center gap-3 min-w-[120px] justify-center
            ${locale === lang 
              ? 'bg-white text-black' 
              : 'text-white hover:bg-white hover:text-black'
            }
          `}
        >
          <div className={`absolute -inset-1 border transition-colors duration-300 ${
            locale === lang ? 'border-gray-800' : 'border-gray-600 group-hover:border-white'
          }`}></div>
          <span className="text-2xl">{getLanguageFlag(lang)}</span>
          <span className="relative font-mono text-sm tracking-wider">
            {getLanguageName(lang)}
          </span>
        </button>
      ))}
    </div>
  );
}
