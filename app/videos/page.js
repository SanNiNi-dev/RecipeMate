'use client'

import { useState } from 'react'
import { ToastContainer, useToast } from '@/components/Toast'
import { useLanguage } from '@/components/LanguageProvider'

const FEATURED_SEARCHES = ['Pasta Carbonara', 'Chocolate Cake', 'Grilled Steak', 'Sushi Rolls', 'Tacos', 'Ramen']

function VideoCard({ video, addToast }) {
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const { t } = useLanguage()

  const formatDuration = (seconds) => {
    if (!seconds) return ''
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleSaveWatchLater = async (event) => {
    event.stopPropagation()
    if (saving) return
    setSaving(true)

    try {
      const res = await fetch('/api/saved-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.youTubeId,
          title: video.title,
          shortUrl: video.shortUrl || `https://youtu.be/${video.youTubeId}`,
          thumbnail: video.thumbnail || `https://img.youtube.com/vi/${video.youTubeId}/hqdefault.jpg`,
        }),
      })
      const data = await res.json()

      if (res.status === 401) {
        addToast(t('videos.sign_in_to_save'), 'warning')
      } else if (!res.ok) {
        addToast(data.error || t('videos.save_failed'), 'error')
      } else if (res.status === 200) {
        addToast(data.message || t('videos.already_saved'), 'info')
      } else {
        addToast(t('videos.saved'), 'success')
      }
    } catch (error) {
      console.error('[SAVE_VIDEO_ERROR]', error)
      addToast(t('videos.save_failed'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="glass-card flex flex-col overflow-hidden group cursor-pointer" onClick={() => setShowModal(true)}>
        {/* Thumbnail */}
        <div className="relative overflow-hidden" style={{ borderRadius: '0.75rem 0.75rem 0 0' }}>
          <img
            src={video.thumbnail || `https://img.youtube.com/vi/${video.youTubeId}/hqdefault.jpg`}
            alt={video.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
              <svg className="w-6 h-6 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          {/* Duration */}
          {video.length && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-xs text-white font-mono">
              {formatDuration(video.length)}
            </div>
          )}
          {/* YouTube badge */}
          <div className="absolute top-2 left-2">
            <span className="badge" style={{ background: 'rgba(255,0,0,0.2)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
              {t('videos.youtube')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-2">
          <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
            {video.title}
          </h3>
          {video.views && (
            <p className="text-xs text-slate-500">{t('videos.views', { count: Number(video.views).toLocaleString() })}</p>
          )}
          <div className="flex flex-col gap-2 mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); setShowModal(true) }}
              className="btn-primary text-xs py-2 rounded-lg w-full"
            >
              {t('videos.watch_now')}
            </button>
            <button
              onClick={handleSaveWatchLater}
              disabled={saving}
              className="btn-outline text-xs py-2 rounded-lg w-full disabled:opacity-50"
            >
              {saving ? t('videos.saving') : t('videos.watch_later')}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-3xl glass rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-900/30">
              <h3 className="text-sm font-semibold text-slate-200 line-clamp-1 flex-1 pr-4">{video.title}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${video.youTubeId}?autoplay=1`}
                title={video.title}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function VideosPage() {
  const { toasts, addToast, removeToast } = useToast()
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const searchVideos = async (q) => {
    const searchQuery = q || query
    if (!searchQuery.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const res = await fetch(`/api/videos?q=${encodeURIComponent(searchQuery.trim())}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to fetch videos.')
        setVideos([])
        return
      }

      setVideos(data.videos || [])
      if ((data.videos || []).length === 0) {
        addToast(`No videos found for "${searchQuery}"`, 'info')
      }
    } catch {
      setError(t('common.network_error'))
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    searchVideos()
  }

  return (
    <div className="hero-bg min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Hero Banner */}
      <div className="relative overflow-hidden py-16 px-4">
        <div className="orb w-96 h-96 bg-emerald-500/10 -top-32 -right-32" style={{ animationDelay: '0s' }} />
        <div className="orb w-72 h-72 bg-amber-500/5 bottom-0 -left-24" style={{ animationDelay: '4s' }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            {t('videos.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t('videos.title_1')}</span>
            <br />
            <span className="text-slate-300">{t('videos.title_2')}</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            {t('videos.subtitle')}
          </p>

          {/* Search */}
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl mx-auto">
            <input
              id="video-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('videos.search_placeholder')}
              className="input-field flex-1"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-primary px-6 flex-shrink-0"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : `🔍 ${t('common.search')}`}
            </button>
          </form>

          {/* Featured tags */}
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {FEATURED_SEARCHES.map((tag) => (
              <button
                key={tag}
                onClick={() => { setQuery(tag); searchVideos(tag) }}
                className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a
              href="/videos/watch-later"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/10 transition"
            >
              {t('videos.view_saved')}
            </a>
          </div>
        </div>
      </div>

      <div className="page-container pt-0">
        {/* Error */}
        {error && (
          <div className="glass-card p-6 text-center border-red-500/20 mb-8">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="video-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden glass-card">
                <div className="skeleton h-48" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 rounded w-4/5" />
                  <div className="skeleton h-3 rounded w-2/5" />
                  <div className="skeleton h-8 rounded-lg mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && searched && videos.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="text-xl font-semibold text-slate-300 mb-2">{t('videos.no_videos')}</h2>
            <p className="text-slate-500">{t('videos.no_videos_message')}</p>
          </div>
        )}

        {/* Landing CTA when nothing searched */}
        {!loading && !searched && (
          <div className="grid md:grid-cols-3 gap-6 py-4">
            {[
              { emoji: '👨‍🍳', title: t('videos.cta_chef_title'), desc: t('videos.cta_chef_desc') },
              { emoji: '🌍', title: t('videos.cta_world_title'), desc: t('videos.cta_world_desc') },
              { emoji: '⚡', title: t('videos.cta_quick_title'), desc: t('videos.cta_quick_desc') },
            ].map((f) => (
              <div key={f.title} className="glass-card p-6 text-center">
                <div className="text-4xl mb-3">{f.emoji}</div>
                <h3 className="font-semibold text-slate-200 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Video Results */}
        {!loading && videos.length > 0 && (
          <>
            <p className="text-sm text-slate-500 mb-4">{t('videos.videos_found', { count: videos.length })}</p>
            <div className="video-grid">
              {videos.map((video) => (
                <VideoCard key={video.youTubeId} video={video} addToast={addToast} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
