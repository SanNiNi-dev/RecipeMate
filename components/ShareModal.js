'use client'

import { useState, useEffect, useRef } from 'react'

export default function ShareModal({ title, url, trigger, compact = false }) {
  const [open, setOpen]       = useState(false)
  const [copied, setCopied]   = useState(false)
  const [mounted, setMounted] = useState(false)
  const modalRef              = useRef(null)

  // ── ALL hooks must come before any conditional return ──────
  useEffect(() => { setMounted(true) }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setOpen(false)
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
  // ──────────────────────────────────────────────────────────

  // Defer window access until after hydration
  const shareUrl  = mounted ? (url || window.location.href) : (url || '')
  const shareText = `🍽️ Check out this recipe: ${title}`

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text: shareText, url: shareUrl }); setOpen(false) }
      catch { /* cancelled */ }
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const el = document.createElement('input')
      el.value = shareUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOptions = [
    ...(mounted && navigator.share
      ? [{ id: 'native', label: 'Share…', icon: '📤', action: handleNativeShare, color: 'text-blue-300' }]
      : []),
    {
      id: 'copy',
      label: copied ? 'Copied!' : 'Copy Link',
      icon:  copied ? '✅' : '🔗',
      action: handleCopy,
      color: copied ? 'text-emerald-300' : 'text-slate-200',
    },
    {
      id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: 'text-green-300',
      action: () => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank'); setOpen(false) },
    },
    {
      id: 'twitter', label: 'X (Twitter)', icon: '🐦', color: 'text-sky-300',
      action: () => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=550,height=420'); setOpen(false) },
    },
    {
      id: 'email', label: 'Email', icon: '✉️', color: 'text-violet-300',
      action: () => { window.location.href = `mailto:?subject=${encodeURIComponent('Recipe: ' + title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`; setOpen(false) },
    },
  ]

  const triggerBtn = compact ? (
    <button onClick={() => setOpen((v) => !v)} className="share-btn-compact" aria-label="Share recipe" title="Share this recipe">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    </button>
  ) : (
    <button onClick={() => setOpen((v) => !v)} className="btn-share" aria-label="Share recipe">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      Share
    </button>
  )

  // Only render trigger until mounted — keeps server/client HTML identical
  if (!mounted) {
    return <div className="share-wrapper">{trigger ? trigger({ open: false, setOpen }) : triggerBtn}</div>
  }

  return (
    <div className="share-wrapper" ref={modalRef}>
      {trigger ? trigger({ open, setOpen }) : triggerBtn}

      {open && (
        <div className="share-dropdown" role="dialog" aria-modal="true" aria-label="Share options">
          <div className="share-dropdown-header">
            <span className="text-sm font-semibold text-slate-200">Share Recipe</span>
            <button onClick={() => setOpen(false)} className="share-close-btn" aria-label="Close">×</button>
          </div>

          <div className="share-url-preview">
            <span className="share-url-text">{shareUrl.replace(/^https?:\/\//, '')}</span>
          </div>

          <div className="share-options">
            {shareOptions.map((opt) => (
              <button key={opt.id} onClick={opt.action} className={`share-option ${opt.color}`}>
                <span className="share-option-icon">{opt.icon}</span>
                <span className="share-option-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
