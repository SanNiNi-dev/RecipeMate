'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, useToast } from '@/components/Toast'

export default function VideoWatchLaterPage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [savedVideos, setSavedVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [removing, setRemoving] = useState(null)

  async function fetchSavedVideos() {
    setLoading(true)
    try {
      const res = await fetch('/api/saved-videos')
      if (res.status === 401) {
        setUnauthorized(true)
        return
      }
      const data = await res.json()
      setSavedVideos(data.savedVideos || [])
    } catch {
      addToast('Failed to load saved videos.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSavedVideos()
  }, [])

  const handleRemove = async (id) => {
    setRemoving(id)
    try {
      const res = await fetch(`/api/saved-videos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSavedVideos((prev) => prev.filter((video) => video.id !== id))
        addToast('Removed from Watch Later.', 'success')
      } else if (res.status === 401) {
        setUnauthorized(true)
      } else {
        addToast('Failed to remove saved video.', 'error')
      }
    } catch {
      addToast('Network error.', 'error')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="hero-bg min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="page-container">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">⭐ Saved Videos</h1>
          <p className="text-slate-400">Videos you saved to watch later.</p>
        </div>

        {unauthorized && (
          <div className="glass-card p-12 text-center max-w-lg mx-auto">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">Sign In Required</h2>
            <p className="text-slate-400 mb-6">Sign in to view and manage your saved videos.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push('/login')} className="btn-primary px-6 py-2.5">Sign In</button>
              <button onClick={() => router.push('/register')} className="btn-outline px-6 py-2.5">Register</button>
            </div>
          </div>
        )}

        {loading && !unauthorized && (
          <div className="grid md:grid-cols-3 gap-6 py-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="glass-card p-4 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && !unauthorized && savedVideos.length === 0 && (
          <div className="glass-card p-16 text-center max-w-xl mx-auto">
            <div className="text-7xl mb-5">📭</div>
            <h2 className="text-2xl font-bold text-slate-200 mb-3">Your list is empty</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Search for a video and save it to watch later from the results page.
            </p>
            <button onClick={() => router.push('/videos')} className="btn-primary px-8 py-3 text-base">
              Browse Videos
            </button>
          </div>
        )}

        {!loading && !unauthorized && savedVideos.length > 0 && (
          <>
            <p className="text-sm text-slate-500 mb-4">
              {savedVideos.length} saved video{savedVideos.length !== 1 ? 's' : ''}
            </p>
            <div className="video-grid">
              {savedVideos.map((video) => (
                <div key={video.id} className="glass-card flex flex-col overflow-hidden group">
                  <div className="relative overflow-hidden" style={{ borderRadius: '0.75rem 0.75rem 0 0' }}>
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Saved {new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex gap-2 mt-auto">
                      <a
                        href={video.shortUrl || `https://youtu.be/${video.videoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 btn-primary text-xs py-2 rounded-lg text-center"
                      >
                        ▶ Watch Now
                      </a>
                      <button
                        onClick={() => handleRemove(video.id)}
                        disabled={removing === video.id}
                        className="flex-1 btn-danger text-xs py-2 rounded-lg disabled:opacity-50"
                      >
                        {removing === video.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
