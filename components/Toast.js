'use client'

import { useEffect, useState } from 'react'

/**
 * Global Toast component - renders fixed toast notifications.
 * Usage: import and render once in layout, or use inline per-page.
 */
export function Toast({ message, type = 'success', onClose }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(onClose, 300)
    }, 3200)
    return () => clearTimeout(timer)
  }, [onClose])

  const styles = {
    success: {
      bg: 'bg-emerald-900/90 border-emerald-500/60',
      icon: '✅',
      text: 'text-emerald-100',
    },
    error: {
      bg: 'bg-red-900/90 border-red-500/60',
      icon: '❌',
      text: 'text-red-100',
    },
    warning: {
      bg: 'bg-amber-900/90 border-amber-500/60',
      icon: '⚠️',
      text: 'text-amber-100',
    },
    info: {
      bg: 'bg-blue-900/90 border-blue-500/60',
      icon: 'ℹ️',
      text: 'text-blue-100',
    },
  }

  const s = styles[type] || styles.info

  return (
    <div
      className={`
        flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-md shadow-xl
        ${s.bg} ${s.text}
        ${exiting ? 'toast-exit' : 'toast-enter'}
      `}
    >
      <span className="text-lg">{s.icon}</span>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => { setExiting(true); setTimeout(onClose, 300) }}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}

/**
 * ToastContainer — place near top of your page/layout.
 * toasts: [{ id, message, type }]
 * removeToast: (id) => void
 */
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        </div>
      ))}
    </div>
  )
}

/**
 * useToast hook — manages toast state
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}
