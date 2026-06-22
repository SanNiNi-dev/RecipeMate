'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, useToast } from '@/components/Toast'
import { useLanguage } from '@/components/LanguageProvider'

export default function HistoryPage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const { t } = useLanguage()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history')
      if (res.status === 401) { setUnauthorized(true); return }
      const data = await res.json()
      setHistory(data.history || [])
    } catch {
      addToast(t('history.load_failed'), 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleSearchAgain = (searchText) => {
    router.push(`/results?q=${encodeURIComponent(searchText)}`)
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="hero-bg min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="page-container max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">{t('history.title')}</h1>
          <p className="text-slate-400">{t('history.subtitle')}</p>
        </div>

        {/* Unauthorized */}
        {unauthorized && (
          <div className="glass-card p-10 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">{t('history.sign_in_required')}</h2>
            <p className="text-slate-400 mb-6">{t('history.sign_in_message')}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push('/login')} className="btn-primary px-6 py-2.5">{t('common.sign_in')}</button>
              <button onClick={() => router.push('/register')} className="btn-outline px-6 py-2.5">{t('common.register')}</button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && !unauthorized && (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !unauthorized && history.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">{t('history.no_searches')}</h2>
            <p className="text-slate-400 mb-6">{t('history.no_searches_message')}</p>
            <button onClick={() => router.push('/')} className="btn-primary px-6 py-2.5">
              {t('common.find_recipes')}
            </button>
          </div>
        )}

        {/* History List */}
        {!loading && !unauthorized && history.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-500 mb-1">{t('history.searches_count', { count: history.length })}</p>
            {history.map((item, index) => (
              <div
                key={item.id}
                className="glass-card p-4 flex items-center gap-4 hover:border-emerald-500/30 transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Index number */}
                <div className="min-w-[2.5rem] h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
                  {index + 1}
                </div>

                {/* Search text */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate">{item.searchText}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDate(item.createdAt)} &bull; {formatTime(item.createdAt)}
                  </p>
                </div>

                {/* Search Again button */}
                <button
                  onClick={() => handleSearchAgain(item.searchText)}
                  className="btn-outline flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {t('common.search_again')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
