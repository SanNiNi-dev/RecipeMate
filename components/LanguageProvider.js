'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { createT, LANGUAGES, DEFAULT_LANGUAGE, STORAGE_KEY } from '@/lib/i18n'

const LanguageContext = createContext(null)

/**
 * Detect the stored/browser language.
 * Priority: localStorage → browser language → DEFAULT_LANGUAGE
 */
function detectLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && LANGUAGES.some((l) => l.code === stored)) return stored
  } catch {}
  try {
    const browserLang = navigator.language?.slice(0, 2)
    if (browserLang && LANGUAGES.some((l) => l.code === browserLang)) return browserLang
  } catch {}
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }) {
  // Always start with DEFAULT_LANGUAGE so the first client render matches the
  // server-rendered HTML (which also uses DEFAULT_LANGUAGE).  The real stored
  // language is applied in the useEffect below, after hydration.
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE)

  // After hydration, read the user's preferred language from localStorage /
  // browser and apply it.  This avoids the server ↔ client text mismatch.
  useEffect(() => {
    const detected = detectLanguage()
    if (detected !== DEFAULT_LANGUAGE) {
      setLanguageState(detected)
      document.documentElement.lang = detected
    }
  }, [])

  const setLanguage = useCallback((code) => {
    if (!LANGUAGES.some((l) => l.code === code)) return
    setLanguageState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {}
    document.documentElement.lang = code
  }, [])

  // Keep <html lang> in sync whenever language changes
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
