'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, translations, TranslationDictionary } from './translations';

export type Timezone = 'ICT' | 'UTC';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  timezone: Timezone;
  setTimezone: (tz: Timezone) => void;
  toggleTimezone: () => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'frabpulse-locale';
const TIMEZONE_KEY = 'frabpulse-timezone';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');
  const [timezone, setTimezoneState] = useState<Timezone>('ICT');

  useEffect(() => {
    // Read persisted preference or default to Vietnamese and ICT
    try {
      const savedLocale = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (savedLocale === 'vi' || savedLocale === 'en') {
        setLocaleState(savedLocale);
        document.documentElement.lang = savedLocale;
      } else {
        document.documentElement.lang = 'vi';
      }

      const savedTz = localStorage.getItem(TIMEZONE_KEY) as Timezone | null;
      if (savedTz === 'ICT' || savedTz === 'UTC') {
        setTimezoneState(savedTz);
      }
    } catch {
      // Fallback
      document.documentElement.lang = 'vi';
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // Ignore storage errors
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  };

  const setTimezone = (newTz: Timezone) => {
    setTimezoneState(newTz);
    try {
      localStorage.setItem(TIMEZONE_KEY, newTz);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleTimezone = () => {
    setTimezone(timezone === 'ICT' ? 'UTC' : 'ICT');
  };

  const t = translations[locale];

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        timezone,
        setTimezone,
        toggleTimezone,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
