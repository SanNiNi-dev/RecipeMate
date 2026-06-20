'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// mode: 'dark' | 'light'
// resolvedTheme: the actual 'dark' | 'light' being applied
const ThemeContext = createContext({
  mode: 'dark',
  resolvedTheme: 'dark',
  setMode: () => {},
})

/** Apply the resolved theme to <html data-theme="..."> */
function applyTheme(resolved) {
  document.documentElement.setAttribute('data-theme', resolved)
}



export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('dark')
  const [resolvedTheme, setResolvedTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)

  // On mount: read stored mode and apply it
  useEffect(() => {
    const stored = localStorage.getItem('rm-theme-mode') || 'dark'
    setModeState(stored)
    setResolvedTheme(stored)
    applyTheme(stored)
    setMounted(true)
  }, [])



  const setMode = useCallback((newMode) => {
    setModeState(newMode)
    setResolvedTheme(newMode)
    localStorage.setItem('rm-theme-mode', newMode)
    applyTheme(newMode)
  }, [])

  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ mode: 'dark', resolvedTheme: 'dark', setMode }}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
