'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/components/LanguageProvider'

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage, languages, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const current = languages.find((l) => l.code === language) || languages[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        id="language-switcher-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('common.language')}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: compact ? '4px' : '6px',
          padding: compact ? '5px 8px' : '5px 12px',
          borderRadius: '10px',
          border: '1px solid rgba(16,185,129,0.18)',
          background: 'rgba(16,185,129,0.06)',
          cursor: 'pointer',
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          color: 'var(--text-secondary)',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>{current.flag}</span>
        {!compact && (
          <span style={{ whiteSpace: 'nowrap' }}>{current.label}</span>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label={t('common.language')}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: '160px',
            background: 'rgba(10, 17, 35, 0.97)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.1)',
            padding: '4px',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          {languages.map((lang) => {
            const isActive = lang.code === language
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setLanguage(lang.code)
                  setOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: isActive ? '#34d399' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(16,185,129,0.08)'
                    e.currentTarget.style.color = '#6ee7b7'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>{lang.flag}</span>
                <span style={{ flex: 1 }}>{lang.label}</span>
                {isActive && (
                  <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
