'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SupportedLocale = 'es' | 'en' | 'ru' | 'zh';

// Importar las traducciones
import esMessages from '../messages/es.json';
import enMessages from '../messages/en.json';
import ruMessages from '../messages/ru.json';
import zhMessages from '../messages/zh.json';

const messages = {
  es: esMessages,
  en: enMessages,
  ru: ruMessages,
  zh: zhMessages
};

interface LanguageContextType {
  locale: SupportedLocale;
  changeLanguage: (newLocale: SupportedLocale) => void;
  getLanguageFlag: (lang: SupportedLocale) => string;
  getLanguageName: (lang: SupportedLocale) => string;
  t: (key: string) => string;
  isClient: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>('es');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Cargar idioma guardado del localStorage
    const savedLocale = localStorage.getItem('preferred-language') as SupportedLocale;
    if (savedLocale && ['es', 'en', 'ru', 'zh'].includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  const changeLanguage = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    if (isClient) {
      localStorage.setItem('preferred-language', newLocale);
    }
  };

  const getLanguageFlag = (lang: SupportedLocale) => {
    const flags = {
      es: '🇪🇸',
      en: '🇺🇸',
      ru: '🇷🇺',
      zh: '🇨🇳'
    };
    return flags[lang];
  };

  const getLanguageName = (lang: SupportedLocale) => {
    const names = {
      es: 'Español',
      en: 'English',
      ru: 'Русский',
      zh: '中文'
    };
    return names[lang];
  };

  // Función para obtener traducciones
  const t = (key: string) => {
    const keys = key.split('.');
    let value: unknown = messages[locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{
      locale,
      changeLanguage,
      getLanguageFlag,
      getLanguageName,
      t,
      isClient
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
