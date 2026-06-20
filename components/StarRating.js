'use client'

import { useState, useEffect } from 'react'

/**
 * StarRating — interactive 5-star rating widget.
 * Persists per recipe in localStorage under key: `rm_rating_<recipeId>`
 *
 * Props:
 *  recipeId  — unique recipe identifier (string | number)
 *  size      — 'sm' | 'md' | 'lg'  (default: 'md')
 *  readOnly  — if true, only displays rating without interaction
 *  onRate    — optional callback (rating: number) => void
 */
export default function StarRating({ recipeId, size = 'md', readOnly = false, onRate }) {
  const storageKey = `rm_rating_${recipeId}`
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [justRated, setJustRated] = useState(false)

  // Load saved rating on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setRating(parseInt(saved, 10))
    } catch {
      // ignore localStorage errors
    }
  }, [storageKey])

  const handleRate = (star) => {
    if (readOnly) return
    const newRating = rating === star ? 0 : star // toggle off if same
    setRating(newRating)
    setJustRated(true)
    setTimeout(() => setJustRated(false), 600)
    try {
      if (newRating === 0) localStorage.removeItem(storageKey)
      else localStorage.setItem(storageKey, String(newRating))
    } catch {
      // ignore
    }
    onRate?.(newRating)
  }

  const sizeClasses = {
    sm: 'text-sm gap-0.5',
    md: 'text-xl gap-1',
    lg: 'text-3xl gap-1.5',
  }

  const active = hovered || rating

  return (
    <div className={`flex items-center ${sizeClasses[size]} star-rating-wrapper`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => handleRate(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`star-btn ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${
            star <= active ? 'star-active' : 'star-inactive'
          } ${justRated && star <= rating ? 'star-pop' : ''}`}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      {!readOnly && rating > 0 && (
        <span className="star-label ml-1">
          {['', 'Awful', 'Poor', 'Okay', 'Good', 'Amazing!'][rating]}
        </span>
      )}
    </div>
  )
}
