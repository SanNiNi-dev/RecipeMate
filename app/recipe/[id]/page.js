'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, useToast } from '@/components/Toast'
import StarRating from '@/components/StarRating'
import ShareModal from '@/components/ShareModal'

function NutrientBar({ label, amount, unit, percent, color }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">
          {Math.round(amount)}{unit}
          {percent != null && <span className="text-slate-500 ml-1">({Math.round(percent)}%)</span>}
        </span>
      </div>
      <div className="nutrient-bar">
        <div
          className="nutrient-bar-fill"
          style={{
            width: `${Math.min(percent ?? 50, 100)}%`,
            background: color || 'linear-gradient(90deg, #10b981, #34d399)',
          }}
        />
      </div>
    </div>
  )
}

export default function RecipeDetailPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()

  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('ingredients')

  useEffect(() => {
    if (!id) return

    const fetchRecipe = async () => {
      setLoading(true)
      try {
        const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY
        const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${apiKey}`
        const res = await fetch(url)

        if (!res.ok) {
          setError(res.status === 404 ? 'Recipe not found.' : 'Failed to load recipe details.')
          return
        }

        const data = await res.json()
        setRecipe(data)
      } catch {
        setError('Network error. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [id])

  const handleSaveWatchLater = async () => {
    if (!recipe) return
    setSaving(true)
    try {
      const res = await fetch('/api/watch-later', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image || '',
          sourceUrl: recipe.sourceUrl || '',
        }),
      })

      if (res.status === 401) {
        addToast('Please sign in to save recipes.', 'warning')
        return
      }

      const data = await res.json()
      if (res.ok) {
        addToast(
          data.message?.includes('already') ? 'Already in your Watch Later list!' : '⭐ Saved to Watch Later!',
          'success'
        )
      }
    } catch {
      addToast('Failed to save. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Helpers
  const getNutrient = (name) =>
    recipe?.nutrition?.nutrients?.find((n) => n.name.toLowerCase() === name.toLowerCase())

  const calories = getNutrient('Calories')
  const protein = getNutrient('Protein')
  const fat = getNutrient('Fat')
  const carbs = getNutrient('Carbohydrates')
  const fiber = getNutrient('Fiber')
  const sugar = getNutrient('Sugar')

  const steps = recipe?.analyzedInstructions?.[0]?.steps || []
  const extendedIngredients = recipe?.extendedIngredients || []

  // Loading skeleton
  if (loading) {
    return (
      <div className="hero-bg min-h-screen">
        <div className="page-container max-w-5xl mx-auto">
          <div className="skeleton h-8 w-48 rounded-lg mb-6" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="skeleton rounded-2xl h-80" />
            <div className="flex flex-col gap-4">
              <div className="skeleton h-8 rounded-lg w-3/4" />
              <div className="skeleton h-4 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="hero-bg min-h-screen">
        <div className="page-container flex flex-col items-center justify-center py-24">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">{error}</h2>
          <button onClick={() => router.back()} className="btn-primary px-6 py-2.5 mt-4">Go Back</button>
        </div>
      </div>
    )
  }

  if (!recipe) return null

  return (
    <div className="hero-bg min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="page-container max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 text-sm mb-6 transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Results
        </button>

        {/* Hero Row */}
        <div className="grid lg:grid-cols-5 gap-8 mb-8">
          {/* Image */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {recipe.image ? (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-72 lg:h-full object-cover"
                />
              ) : (
                <div className="h-72 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-7xl">🍽️</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-5">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {recipe.vegetarian && <span className="badge badge-emerald">🥦 Vegetarian</span>}
              {recipe.vegan && <span className="badge badge-emerald">🌱 Vegan</span>}
              {recipe.glutenFree && <span className="badge badge-amber">🌾 Gluten-Free</span>}
              {recipe.dairyFree && <span className="badge badge-amber">🥛 Dairy-Free</span>}
              {recipe.veryHealthy && <span className="badge badge-emerald">💪 Very Healthy</span>}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 leading-snug">
              {recipe.title}
            </h1>

            {/* Star Rating */}
            <div className="flex flex-col gap-1">
              <StarRating recipeId={id} size="lg" />
              <p className="text-xs text-slate-500">Your personal rating (saved locally)</p>
            </div>

            {/* Meta stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: '⏱️', label: 'Cook Time', value: recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : 'N/A' },
                { icon: '👥', label: 'Servings', value: recipe.servings || 'N/A' },
                { icon: '❤️', label: 'Health Score', value: recipe.healthScore ? `${recipe.healthScore}/100` : 'N/A' },
                { icon: '⭐', label: 'Recipe Score', value: recipe.spoonacularScore ? `${Math.round(recipe.spoonacularScore)}%` : 'N/A' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-3 text-center">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <div className="text-slate-100 font-bold text-sm">{stat.value}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Source, Save & Share */}
            <div className="flex flex-wrap gap-3 items-center">
              {recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-sm flex items-center gap-2"
                >
                  🔗 Original Recipe
                </a>
              )}
              <button
                onClick={handleSaveWatchLater}
                disabled={saving}
                className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : '⭐'}
                Save to Watch Later
              </button>
              <ShareModal title={recipe.title} />
            </div>
          </div>
        </div>

        {/* Nutrition Card */}
        {recipe.nutrition && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              📊 Nutritional Information
              <span className="text-xs text-slate-500 font-normal">per serving</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {calories && (
                <div className="glass-card p-4 text-center border-emerald-500/20">
                  <p className="text-3xl font-black gradient-text">{Math.round(calories.amount)}</p>
                  <p className="text-xs text-slate-400 mt-1">Calories (kcal)</p>
                </div>
              )}
              <div className="sm:col-span-1 lg:col-span-2 flex flex-col gap-3">
                {protein && (
                  <NutrientBar label="Protein" amount={protein.amount} unit={protein.unit}
                    percent={protein.percentOfDailyNeeds}
                    color="linear-gradient(90deg, #10b981, #34d399)" />
                )}
                {carbs && (
                  <NutrientBar label="Carbohydrates" amount={carbs.amount} unit={carbs.unit}
                    percent={carbs.percentOfDailyNeeds}
                    color="linear-gradient(90deg, #f59e0b, #fbbf24)" />
                )}
                {fat && (
                  <NutrientBar label="Total Fat" amount={fat.amount} unit={fat.unit}
                    percent={fat.percentOfDailyNeeds}
                    color="linear-gradient(90deg, #ef4444, #f87171)" />
                )}
                {fiber && (
                  <NutrientBar label="Fiber" amount={fiber.amount} unit={fiber.unit}
                    percent={fiber.percentOfDailyNeeds}
                    color="linear-gradient(90deg, #8b5cf6, #a78bfa)" />
                )}
                {sugar && (
                  <NutrientBar label="Sugar" amount={sugar.amount} unit={sugar.unit}
                    percent={sugar.percentOfDailyNeeds}
                    color="linear-gradient(90deg, #ec4899, #f472b6)" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-0">
          {[
            { id: 'ingredients', label: `🧂 Ingredients (${extendedIngredients.length})` },
            { id: 'instructions', label: `👩‍🍳 Instructions (${steps.length} steps)` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'text-emerald-400 border-emerald-400 bg-emerald-400/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ingredients Tab */}
        {activeTab === 'ingredients' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {extendedIngredients.length === 0 && (
              <p className="text-slate-500 col-span-full py-8 text-center">No ingredient data available.</p>
            )}
            {extendedIngredients.map((ing, i) => (
              <div key={`${ing.id}-${i}`} className="glass-card p-3.5 flex items-center gap-3">
                {ing.image && (
                  <img
                    src={`https://spoonacular.com/cdn/ingredients_100x100/${ing.image}`}
                    alt={ing.name}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-slate-200 text-sm font-medium capitalize truncate">{ing.name}</p>
                  <p className="text-xs text-slate-500">{ing.original}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions Tab */}
        {activeTab === 'instructions' && (
          <div className="flex flex-col gap-3">
            {steps.length === 0 && (
              <div className="glass-card p-8 text-center">
                <p className="text-slate-500">No step-by-step instructions available for this recipe.</p>
                {recipe.sourceUrl && (
                  <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-outline mt-4 inline-block">
                    View on Original Site
                  </a>
                )}
              </div>
            )}
            {steps.map((step) => (
              <div key={step.number} className="step-card">
                <div className="step-number">{step.number}</div>
                <div className="flex-1">
                  <p className="text-slate-200 text-sm leading-relaxed">{step.step}</p>
                  {step.ingredients && step.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {step.ingredients.map((ing) => (
                        <span key={ing.id} className="badge badge-emerald text-xs">
                          {ing.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-12" />
      </div>
    </div>
  )
}
