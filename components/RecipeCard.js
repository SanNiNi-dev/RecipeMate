'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StarRating from '@/components/StarRating'
import ShareModal from '@/components/ShareModal'

export default function RecipeCard({ recipe, onRemove, showRemove = false }) {
  const { id, title, image, missedIngredientCount, sourceUrl } = recipe
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)
  const [recipePageUrl, setRecipePageUrl] = useState(`/recipe/${id}`)

  // Set full URL only on client to avoid hydration mismatch
  useEffect(() => {
    setRecipePageUrl(`${window.location.origin}/recipe/${id}`)
  }, [id])

  const showNotif = (type, msg) => {
    setNotification({ type, msg })
    setTimeout(() => setNotification(null), 3500)
  }

  const handleSaveWatchLater = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/watch-later', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: id,
          title,
          image: image || '',
          sourceUrl: sourceUrl || `https://spoonacular.com/recipes/${title.replace(/\s+/g, '-').toLowerCase()}-${id}`,
        }),
      })

      if (res.status === 401) {
        showNotif('warning', '🔐 Please login to save recipes!')
        return
      }

      if (!res.ok) {
        showNotif('error', 'Failed to save. Please try again.')
        return
      }

      const data = await res.json()
      if (res.status === 200 && data.message?.includes('already')) {
        showNotif('success', '✅ Already in your Watch Later list!')
      } else {
        showNotif('success', '⭐ Saved to Watch Later!')
      }
    } catch {
      showNotif('error', 'Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const notifColors = {
    success: 'bg-emerald-900/80 border-emerald-500/50 text-emerald-200',
    error: 'bg-red-900/80 border-red-500/50 text-red-200',
    warning: 'bg-amber-900/80 border-amber-500/50 text-amber-200',
  }

  return (
    <div className="glass-card flex flex-col overflow-hidden group">
      {/* Image */}
      <div className="recipe-img-overlay">
        {image ? (
          <img
            src={image}
            alt={title}
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
        {/* Missing ingredients badge */}
        {typeof missedIngredientCount === 'number' && (
          <div className="absolute top-3 right-3 z-10">
            <span className={`badge ${missedIngredientCount === 0 ? 'badge-emerald' : missedIngredientCount <= 2 ? 'badge-amber' : 'badge-red'}`}>
              {missedIngredientCount === 0 ? '✓ All ingredients' : `${missedIngredientCount} missing`}
            </span>
          </div>
        )}

        {/* Share button overlay — top-left corner */}
        <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ShareModal title={title} url={recipePageUrl} compact />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold text-slate-100 leading-snug line-clamp-2 text-sm group-hover:text-emerald-300 transition-colors">
          {title}
        </h3>

        {/* Star Rating */}
        <div className="flex items-center">
          <StarRating recipeId={id} size="sm" />
        </div>

        {/* Notification */}
        {notification && (
          <div className={`text-xs px-3 py-2 rounded-lg border backdrop-blur-sm ${notifColors[notification.type]}`}>
            {notification.msg}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={`/recipe/${id}`}
            className="flex-1 text-center btn-primary text-xs py-2 rounded-lg"
          >
            View Recipe
          </Link>

          {showRemove ? (
            <button
              onClick={() => onRemove && onRemove(recipe.dbId || recipe.id)}
              className="flex-1 btn-danger text-xs py-2 rounded-lg"
            >
              🗑️ Remove
            </button>
          ) : (
            <button
              onClick={handleSaveWatchLater}
              disabled={saving}
              className="flex-1 btn-outline text-xs py-2"
            >
              {saving ? '...' : '⭐ Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
