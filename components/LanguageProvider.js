'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { createT, LANGUAGES, DEFAULT_LANGUAGE, STORAGE_KEY } from '@/lib/i18n'

const LanguageContext = createContext(null)

/**
 * Detect the best initial language before React hydrates.
 * Priority: localStorage → browser language → 'en'
 */
function getInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && LANGUAGES.some((l) => l.code === stored)) return stored
  } catch {}
  // Check browser language
  try {
    const browserLang = navigator.language?.slice(0, 2)
    if (browserLang && LANGUAGES.some((l) => l.code === browserLang)) return browserLang
  } catch {}
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage)

  const setLanguage = useCallback((code) => {
    if (!LANGUAGES.some((l) => l.code === code)) return
    setLanguageState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {}
    document.documentElement.lang = code
  }, [])

  // Sync <html lang> on mount
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const t = useMemo(() => createT(language), [language])

  const value = useMemo(
    () => ({ language, setLanguage, t, languages: LANGUAGES }),
    [language, setLanguage, t]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
