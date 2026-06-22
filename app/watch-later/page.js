'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, useToast } from '@/components/Toast'
import { useLanguage } from '@/components/LanguageProvider'

export default function WatchLaterPage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const { t } = useLanguage()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [removing, setRemoving] = useState(null)

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await fetch('/api/watch-later')
      if (res.status === 401) { setUnauthorized(true); return }
      const data = await res.json()
      setRecipes(data.recipes || [])
    } catch {
      addToast(t('watch_later.load_failed'), 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRecipes() }, [fetchRecipes])

  const handleRemove = async (id) => {
    setRemoving(id)
    try {
      const res = await fetch(`/api/watch-later/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRecipes((prev) => prev.filter((r) => r.id !== id))
        addToast(t('watch_later.removed'), 'success')
      } else {
        addToast(t('watch_later.remove_failed'), 'error')
      }
    } catch {
      addToast(t('common.network_error'), 'error')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="hero-bg min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">{t('watch_later.title')}</h1>
          <p className="text-slate-400">{t('watch_later.subtitle')}</p>
        </div>

        {/* Unauthorized */}
        {unauthorized && (
          <div className="glass-card p-12 text-center max-w-lg mx-auto">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">{t('watch_later.members_only')}</h2>
            <p className="text-slate-400 mb-6">{t('watch_later.sign_in_message')}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push('/login')} className="btn-primary px-6 py-2.5">{t('common.sign_in')}</button>
              <button onClick={() => router.push('/register')} className="btn-outline px-6 py-2.5">{t('common.register')}</button>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !unauthorized && (
          <div className="recipe-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="skeleton h-48" />
                <div className="glass-card rounded-t-none p-4 space-y-2 border-t-0">
                  <div className="skeleton h-4 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                  <div className="flex gap-2 mt-3">
                    <div className="skeleton h-8 rounded-lg flex-1" />
                    <div className="skeleton h-8 rounded-lg flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !unauthorized && recipes.length === 0 && (
          <div className="glass-card p-16 text-center max-w-lg mx-auto">
            <div className="text-7xl mb-5">📭</div>
            <h2 className="text-2xl font-bold text-slate-200 mb-3">{t('watch_later.nothing_saved')}</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              {t('watch_later.nothing_saved_message')}
            </p>
            <button onClick={() => router.push('/')} className="btn-primary px-8 py-3 text-base">
              {t('common.explore_recipes')}
            </button>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && !unauthorized && recipes.length > 0 && (
          <>
            <p className="text-sm text-slate-500 mb-4">
              {t('watch_later.saved_count', { count: recipes.length })}
            </p>
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="glass-card flex flex-col overflow-hidden group">
                  {/* Image */}
                  <div className="recipe-img-overlay">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/400x200/1e293b/34d399?text=🍽️`
                        }}
                      />
                    ) : (
                      <div className="h-[200px] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <span className="text-5xl">🍽️</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="badge badge-amber">{t('watch_later.saved_badge')}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-4 gap-3">
                    <h3 className="font-semibold text-slate-100 leading-snug line-clamp-2 text-sm group-hover:text-emerald-300 transition-colors">
                      {recipe.title}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {new Date(recipe.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>

                    <div className="flex gap-2 mt-auto pt-1">
                      <a
                        href={`/recipe/${recipe.recipeId}`}
                        className="flex-1 text-center btn-primary text-xs py-2 rounded-lg"
                      >
                        {t('common.view_recipe')}
                      </a>
                      <button
                        onClick={() => handleRemove(recipe.id)}
                        disabled={removing === recipe.id}
                        className="flex-1 btn-danger text-xs py-2 rounded-lg disabled:opacity-50"
                      >
                        {removing === recipe.id ? '...' : `🗑️ ${t('common.remove')}`}
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
