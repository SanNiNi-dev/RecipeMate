'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import RecipeCard from '@/components/RecipeCard'

/* ── Filter definitions ─────────────────────────────────────── */
const FILTER_GROUPS = [
  {
    id: 'health',
    label: '🏥 Health Conditions',
    color: 'rose',
    filters: [
      { id: 'diabetic',      label: 'Diabetes-Friendly', icon: '🩸', diet: 'diabetic',      desc: 'Low-sugar, low-glycemic' },
      { id: 'low-sodium',    label: 'Hypertension',      icon: '❤️', intolerance: null, tag: 'hypertension', desc: 'Low sodium, heart-safe' },
      { id: 'heart-healthy', label: 'Heart-Healthy',     icon: '💗', diet: null,            desc: 'Low saturated fat & cholesterol', tag: 'heart' },
      { id: 'low-calorie',   label: 'Low Calorie',       icon: '⚖️', tag: 'lowcalorie',     desc: 'Under 400 kcal per serving' },
    ],
  },
  {
    id: 'diet',
    label: '🥗 Diet & Lifestyle',
    color: 'emerald',
    filters: [
      { id: 'vegetarian', label: 'Vegetarian', icon: '🥦', diet: 'vegetarian' },
      { id: 'vegan',      label: 'Vegan',      icon: '🌱', diet: 'vegan' },
      { id: 'ketogenic',  label: 'Keto',       icon: '🥑', diet: 'ketogenic' },
      { id: 'paleo',      label: 'Paleo',      icon: '🍖', diet: 'paleo' },
      { id: 'whole30',    label: 'Whole30',    icon: '🌿', diet: 'whole30' },
      { id: 'primal',     label: 'Primal',     icon: '🫐', diet: 'primal' },
    ],
  },
  {
    id: 'intolerances',
    label: '🚫 Intolerances & Allergies',
    color: 'amber',
    filters: [
      { id: 'gluten',   label: 'Gluten-Free',  icon: '🌾', intolerance: 'gluten' },
      { id: 'dairy',    label: 'Dairy-Free',   icon: '🥛', intolerance: 'dairy' },
      { id: 'peanut',   label: 'Nut-Free',     icon: '🥜', intolerance: 'peanut,tree nut' },
      { id: 'egg',      label: 'Egg-Free',     icon: '🥚', intolerance: 'egg' },
      { id: 'soy',      label: 'Soy-Free',     icon: '🫘', intolerance: 'soy' },
      { id: 'seafood',  label: 'Seafood-Free', icon: '🦐', intolerance: 'seafood' },
    ],
  },
  {
    id: 'time',
    label: '⏱️ Cook Time',
    color: 'violet',
    filters: [
      { id: 'max15',  label: 'Under 15 min', icon: '⚡', maxReadyTime: 15 },
      { id: 'max30',  label: 'Under 30 min', icon: '🕐', maxReadyTime: 30 },
      { id: 'max60',  label: 'Under 1 hour', icon: '🕑', maxReadyTime: 60 },
    ],
  },
]

const COLOR_MAP = {
  rose:    { pill: 'filter-pill-rose',    group: 'filter-group-rose'    },
  emerald: { pill: 'filter-pill-emerald', group: 'filter-group-emerald' },
  amber:   { pill: 'filter-pill-amber',   group: 'filter-group-amber'   },
  violet:  { pill: 'filter-pill-violet',  group: 'filter-group-violet'  },
}

/* ── Helper: build Spoonacular URL ──────────────────────────── */
function buildApiUrl(query, activeFilters, apiKey) {
  const diets = []
  const intolerances = []
  let maxReadyTime = null
  let tags = []

  activeFilters.forEach((filterId) => {
    for (const group of FILTER_GROUPS) {
      const f = group.filters.find((x) => x.id === filterId)
      if (!f) continue
      if (f.diet) diets.push(f.diet)
      if (f.intolerance) intolerances.push(...f.intolerance.split(','))
      if (f.maxReadyTime) {
        maxReadyTime = maxReadyTime ? Math.min(maxReadyTime, f.maxReadyTime) : f.maxReadyTime
      }
      if (f.tag) tags.push(f.tag)
    }
  })

  // Build health query tags for condition-specific searches
  let healthQuery = query
  if (tags.includes('hypertension')) healthQuery += ' low sodium'
  if (tags.includes('heart')) healthQuery += ' low fat'
  if (tags.includes('lowcalorie')) healthQuery += ' light'

  // Use complexSearch which supports diet/intolerance filters
  const params = new URLSearchParams({
    query: healthQuery,
    number: '24',
    addRecipeInformation: 'true',
    fillIngredients: 'true',
    apiKey,
  })

  if (diets.length)        params.set('diet', diets[0]) // Spoonacular takes one diet
  if (intolerances.length) params.set('intolerances', [...new Set(intolerances)].join(','))
  if (maxReadyTime)        params.set('maxReadyTime', String(maxReadyTime))

  return `https://api.spoonacular.com/recipes/complexSearch?${params}`
}

/* ── Filter Chip ────────────────────────────────────────────── */
function FilterChip({ filter, active, onClick, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`filter-chip ${active ? `filter-chip-active ${COLOR_MAP[color]?.pill || ''}` : 'filter-chip-inactive'}`}
      title={filter.desc || filter.label}
    >
      <span className="filter-chip-icon">{filter.icon}</span>
      <span className="filter-chip-label">{filter.label}</span>
      {active && (
        <span className="filter-chip-check">✓</span>
      )}
    </button>
  )
}

/* ── Active Filter Badge ─────────────────────────────────────── */
function ActiveBadge({ label, onRemove }) {
  return (
    <span className="active-filter-badge">
      {label}
      <button onClick={onRemove} className="active-filter-remove" aria-label={`Remove ${label}`}>×</button>
    </span>
  )
}

/* ── Main Results Content ────────────────────────────────────── */
function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''

  const [recipes, setRecipes]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [activeFilters, setActiveFilters] = useState([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [totalCount, setTotalCount]   = useState(0)

  const toggleFilter = (id) => {
    // Cook-time filters are mutually exclusive
    const timeIds = FILTER_GROUPS.find((g) => g.id === 'time').filters.map((f) => f.id)
    setActiveFilters((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (timeIds.includes(id)) return [...prev.filter((x) => !timeIds.includes(x)), id]
      return [...prev, id]
    })
  }

  const clearAll = () => setActiveFilters([])

  const getFilterLabel = (id) => {
    for (const g of FILTER_GROUPS) {
      const f = g.filters.find((x) => x.id === id)
      if (f) return `${f.icon} ${f.label}`
    }
    return id
  }

  const fetchRecipes = useCallback(async () => {
    if (!query.trim()) { setLoading(false); return }
    setLoading(true)
    setError('')

    try {
      const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY

      let url, data

      if (activeFilters.length === 0) {
        // No filters → use fast ingredient-based search
        url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(query)}&number=24&ranking=2&ignorePantry=true&apiKey=${apiKey}`
        const res = await fetch(url)
        if (!res.ok) { handleApiError(res.status); return }
        const raw = await res.json()
        const sorted = (raw || []).sort((a, b) => a.missedIngredientCount - b.missedIngredientCount)
        setRecipes(sorted)
        setTotalCount(sorted.length)
      } else {
        // Filters active → use complexSearch
        url = buildApiUrl(query, activeFilters, apiKey)
        const res = await fetch(url)
        if (!res.ok) { handleApiError(res.status); return }
        data = await res.json()
        setRecipes(data.results || [])
        setTotalCount(data.totalResults || (data.results || []).length)
      }
    } catch {
      setError('Network error. Please check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [query, activeFilters])

  function handleApiError(status) {
    if (status === 402) {
      setError('Spoonacular API quota exceeded. Please try again later.')
    } else {
      setError('Failed to fetch recipes. Please check your API key in .env.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (query) fetchRecipes()
  }, [query, activeFilters, fetchRecipes])

  const activeCount = activeFilters.length

  return (
    <div className="hero-bg min-h-screen">
      <div className="page-container">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 text-sm mb-4 transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>

          <div className="flex flex-wrap items-end gap-4 justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-1">
                Recipes for:{' '}
                <span className="gradient-text">&quot;{query}&quot;</span>
              </h1>
              {!loading && recipes.length > 0 && (
                <p className="text-slate-500 text-sm">
                  {totalCount > recipes.length ? `Showing ${recipes.length} of ${totalCount}` : `${recipes.length}`} recipe{recipes.length !== 1 ? 's' : ''} found
                  {activeCount > 0 && <span className="text-emerald-400 ml-1">· {activeCount} filter{activeCount > 1 ? 's' : ''} active</span>}
                </p>
              )}
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`filter-toggle-btn ${filtersOpen ? 'filter-toggle-btn-open' : ''} ${activeCount > 0 ? 'filter-toggle-btn-active' : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filters
              {activeCount > 0 && (
                <span className="filter-count-badge">{activeCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── Filter Panel ────────────────────────────────────── */}
        {filtersOpen && (
          <div className="filter-panel mb-6">
            <div className="filter-panel-header">
              <span className="text-sm font-semibold text-slate-200">Filter Recipes</span>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button onClick={clearAll} className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium">
                    Clear all ({activeCount})
                  </button>
                )}
                <button onClick={() => setFiltersOpen(false)} className="text-slate-500 hover:text-slate-300 text-xl leading-none transition-colors">×</button>
              </div>
            </div>

            <div className="filter-panel-body">
              {FILTER_GROUPS.map((group) => (
                <div key={group.id} className="filter-group">
                  <p className={`filter-group-label filter-group-label-${group.color}`}>{group.label}</p>
                  <div className="filter-chips-row">
                    {group.filters.map((filter) => (
                      <FilterChip
                        key={filter.id}
                        filter={filter}
                        active={activeFilters.includes(filter.id)}
                        onClick={() => toggleFilter(filter.id)}
                        color={group.color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Active filters summary */}
            {activeCount > 0 && (
              <div className="filter-panel-footer">
                <span className="text-xs text-slate-500 mr-2">Active:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeFilters.map((id) => (
                    <ActiveBadge
                      key={id}
                      label={getFilterLabel(id)}
                      onRemove={() => toggleFilter(id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active filter badges (compact bar when panel closed) */}
        {!filtersOpen && activeCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 items-center">
            <span className="text-xs text-slate-500">Active filters:</span>
            {activeFilters.map((id) => (
              <ActiveBadge key={id} label={getFilterLabel(id)} onRemove={() => toggleFilter(id)} />
            ))}
            <button onClick={clearAll} className="text-xs text-rose-400 hover:text-rose-300 transition-colors ml-1">
              Clear all
            </button>
          </div>
        )}

        {/* ── Loading ─────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🍳</div>
            </div>
            <p className="text-slate-400 font-medium">
              {activeCount > 0 ? `Filtering for ${activeFilters.map(id => getFilterLabel(id)).join(', ')}…` : 'Finding the best recipes…'}
            </p>
            <p className="text-slate-600 text-sm">Searching through thousands of dishes</p>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────── */}
        {error && !loading && (
          <div className="glass-card p-8 text-center border-red-500/20 max-w-lg mx-auto">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-red-300 mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <button onClick={fetchRecipes} className="btn-primary px-6 py-2.5">Try Again</button>
          </div>
        )}

        {/* ── No results ──────────────────────────────────────── */}
        {!loading && !error && recipes.length === 0 && query && (
          <div className="text-center py-20">
            <div className="text-7xl mb-5">{activeCount > 0 ? '🔍' : '🤷'}</div>
            <h2 className="text-2xl font-bold text-slate-300 mb-3">No recipes found</h2>
            <p className="text-slate-500 mb-6">
              {activeCount > 0
                ? <>No recipes match <strong className="text-slate-300">&quot;{query}&quot;</strong> with your current filters.<br />Try removing some filters or adjusting your ingredients.</>
                : <>We couldn&apos;t find recipes for <strong className="text-slate-300">&quot;{query}&quot;</strong>.<br />Try different ingredients or remove some.</>
              }
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {activeCount > 0 && (
                <button onClick={clearAll} className="btn-outline px-6 py-2.5">Clear Filters</button>
              )}
              <button onClick={() => router.push('/')} className="btn-primary px-8 py-3">Try New Search</button>
            </div>
          </div>
        )}

        {/* ── Results grid ────────────────────────────────────── */}
        {!loading && !error && recipes.length > 0 && (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="hero-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading…</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
