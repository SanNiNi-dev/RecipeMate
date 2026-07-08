'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'

/* ── Data ──────────────────────────────────────────────────── */
const POPULAR_INGREDIENTS = [
  'chicken', 'pasta', 'tomatoes', 'eggs', 'cheese',
  'garlic', 'onion', 'rice', 'butter', 'lemon',
]

const CUISINES = [
  { labelKey: 'home.cuisine_italian', emoji: '🇮🇹', q: 'pasta, tomatoes, basil' },
  { labelKey: 'home.cuisine_chinese', emoji: '🇨🇳', q: 'soy sauce, ginger, rice' },
  { labelKey: 'home.cuisine_mexican', emoji: '🇲🇽', q: 'beans, corn, avocado' },
  { labelKey: 'home.cuisine_indian', emoji: '🇮🇳', q: 'chicken, curry, coconut milk' },
  { labelKey: 'home.cuisine_american', emoji: '🇺🇸', q: 'beef, cheese, potatoes' },
  { labelKey: 'home.cuisine_greek', emoji: '🇬🇷', q: 'olive oil, lemon, feta' },
  { labelKey: 'home.cuisine_japanese', emoji: '🇯🇵', q: 'rice, salmon, soy sauce' },
  { labelKey: 'home.cuisine_thai', emoji: '🇹🇭', q: 'coconut milk, lime, chili' },
]

/* ── Animated typing hook ──────────────────────────────────── */
function useTypewriter(words, speed = 100, pause = 2000) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIdx]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1))
        if (charIdx + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause)
        } else {
          setCharIdx(c => c + 1)
        }
      } else {
        setDisplay(current.slice(0, charIdx - 1))
        if (charIdx - 1 === 0) {
          setDeleting(false)
          setWordIdx(w => (w + 1) % words.length)
          setCharIdx(0)
        } else {
          setCharIdx(c => c - 1)
        }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, wordIdx, words, speed, pause])

  return display
}

/* ── Star Rating ───────────────────────────────────────────── */
function Stars({ count }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: '#fbbf24', fontSize: '0.85rem' }}>★</span>
      ))}
    </div>
  )
}

/* ── Main Component ────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [validationError, setValidationError] = useState('')
  const [shake, setShake] = useState(false)
  const { t } = useLanguage()

  const typed = useTypewriter([
    t('home.typewriter_1'),
    t('home.typewriter_2'),
    t('home.typewriter_3'),
    t('home.typewriter_4'),
  ])

  const HOW_IT_WORKS = [
    {
      step: '01',
      icon: '🛒',
      title: t('home.how_step1_title'),
      desc: t('home.how_step1_desc'),
      color: 'from-emerald-500 to-teal-400',
      glow: 'rgba(16,185,129,0.25)',
    },
    {
      step: '02',
      icon: '🤖',
      title: t('home.how_step2_title'),
      desc: t('home.how_step2_desc'),
      color: 'from-violet-500 to-purple-400',
      glow: 'rgba(139,92,246,0.25)',
    },
    {
      step: '03',
      icon: '🍳',
      title: t('home.how_step3_title'),
      desc: t('home.how_step3_desc'),
      color: 'from-amber-500 to-orange-400',
      glow: 'rgba(245,158,11,0.25)',
    },
  ]

  const FEATURES = [
    { emoji: '🔍', title: t('home.feature_search_title'), desc: t('home.feature_search_desc'), color: 'from-emerald-500 to-teal-500', tag: t('home.feature_search_tag') },
    { emoji: '⭐', title: t('home.feature_save_title'), desc: t('home.feature_save_desc'), color: 'from-amber-500 to-orange-500', tag: t('home.feature_save_tag') },
    { emoji: '🎬', title: t('home.feature_video_title'), desc: t('home.feature_video_desc'), color: 'from-purple-500 to-pink-500', tag: t('home.feature_video_tag') },
    { emoji: '🤖', title: t('home.feature_ai_title'), desc: t('home.feature_ai_desc'), color: 'from-cyan-500 to-blue-500', tag: t('home.feature_ai_tag') },
    { emoji: '📊', title: t('home.feature_nutrition_title'), desc: t('home.feature_nutrition_desc'), color: 'from-rose-500 to-pink-500', tag: t('home.feature_nutrition_tag') },
    { emoji: '🕒', title: t('home.feature_history_title'), desc: t('home.feature_history_desc'), color: 'from-slate-500 to-slate-400', tag: t('home.feature_history_tag') },
    { emoji: '🌿', title: t('home.feature_dietary_title'), desc: t('home.feature_dietary_desc'), color: 'from-lime-500 to-green-400', tag: t('home.feature_dietary_tag') },
    { emoji: '⏱️', title: t('home.feature_quick_title'), desc: t('home.feature_quick_desc'), color: 'from-orange-500 to-red-400', tag: t('home.feature_quick_tag') },
  ]

  const TESTIMONIALS = [
    { name: t('home.testimonial1_name'), role: t('home.testimonial1_role'), avatar: '👩‍🍳', text: t('home.testimonial1_text'), stars: 5 },
    { name: t('home.testimonial2_name'), role: t('home.testimonial2_role'), avatar: '👨‍👩‍👧', text: t('home.testimonial2_text'), stars: 5 },
    { name: t('home.testimonial3_name'), role: t('home.testimonial3_role'), avatar: '🧑‍🍳', text: t('home.testimonial3_text'), stars: 5 },
  ]

  const STATS = [
    { value: '5,000+', label: t('home.stat_recipes'), icon: '📖' },
    { value: '50+', label: t('home.stat_cuisines'), icon: '🌍' },
    { value: '100%', label: t('home.stat_free'), icon: '🎉' },
    { value: '24/7', label: t('home.stat_ai'), icon: '🤖' },
  ]

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) {
      setValidationError('Please enter at least one ingredient before searching.')
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }

    setValidationError('')
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchText: query.trim() }),
    })

    router.push(`/results?q=${encodeURIComponent(query.trim())}`)
  }

  const addIngredient = (ingredient) => {
    setQuery((prev) => {
      const existing = prev.split(',').map((s) => s.trim()).filter(Boolean)
      if (existing.map((s) => s.toLowerCase()).includes(ingredient.toLowerCase())) return prev
      return existing.length ? `${prev}, ${ingredient}` : ingredient
    })
    setValidationError('')
  }

  return (
    <div className="hero-bg min-h-screen overflow-hidden">

      {/* ── Floating orbs ─────────────────────────────────────── */}
      <div className="orb w-[600px] h-[600px] bg-emerald-500/6 -top-48 -right-48" style={{ animationDelay: '0s' }} />
      <div className="orb w-96 h-96 bg-amber-400/5 bottom-20 -left-32" style={{ animationDelay: '3s' }} />
      <div className="orb w-64 h-64 bg-violet-400/5 top-1/2 left-1/4" style={{ animationDelay: '6s' }} />

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-16">

        {/* Headline with typewriter */}
        <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.08, marginBottom: '20px', letterSpacing: '-0.02em' }}>
          <span style={{ color: 'var(--text-primary)' }}>{t('home.hero_title_1')}</span>
          <br />
          <span className="gradient-text" style={{ minHeight: '1.2em', display: 'inline-block' }}>
            {typed}<span style={{ borderRight: '3px solid #10b981', marginLeft: '2px', animation: 'pulse 1s infinite' }}>&nbsp;</span>
          </span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.7 }}>
          {t('home.hero_subtitle')}
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '680px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                id="ingredient-search"
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); if (e.target.value.trim()) setValidationError('') }}
                placeholder={t('home.search_placeholder')}
                className={`input-field${shake ? ' search-shake' : ''}${validationError ? ' search-error-border' : ''}`}
                style={{ flex: 1, minWidth: '200px', fontSize: '1rem', padding: '1rem 1.25rem' }}
                aria-describedby={validationError ? 'search-error-msg' : undefined}
                aria-invalid={!!validationError}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '1rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t('common.find_recipes')}
              </button>
            </div>

            {/* Validation error message */}
            {validationError && (
              <div
                id="search-error-msg"
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'rgba(239,68,68,0.10)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  color: '#fca5a5',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  animation: 'fadeSlideDown 0.25s ease',
                }}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
                {validationError}
              </div>
            )}

            {/* Quick ingredient chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 500 }}>{t('home.quick_add')}</span>
              {POPULAR_INGREDIENTS.map((ing) => (
                <button
                  key={ing}
                  type="button"
                  onClick={() => addIngredient(ing)}
                  style={{
                    padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)',
                    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#34d399'; e.currentTarget.style.background = 'rgba(16,185,129,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
                >
                  + {ing}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Trust indicators */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[t('home.trust_1'), t('home.trust_2'), t('home.trust_3')].map(txt => (
            <span key={txt} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{txt}</span>
          ))}
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════════════ */}
      <section className="relative z-10 page-container pb-12">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          {STATS.map((s) => (
            <div key={s.label} className="glass-card" style={{ padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>{s.icon}</div>
              <p className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CUISINE EXPLORER ═══════════════════════════════════════ */}
      <section className="relative z-10 page-container pb-16">
        <div className="divider" />
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: '9999px',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            fontSize: '0.75rem', fontWeight: 600, color: '#34d399', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>{t('home.cuisine_section_tag')}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {t('home.cuisine_section_title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px' }}>
            {t('home.cuisine_section_subtitle')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
            {CUISINES.map((c) => (
              <button
                key={c.labelKey}
                onClick={() => router.push(`/results?q=${encodeURIComponent(c.q)}`)}
                className="glass-card"
                style={{
                  padding: '20px 12px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '8px', cursor: 'pointer',
                  border: '1px solid var(--border-soft)', background: 'var(--glass-card)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <span style={{ fontSize: '2.75rem', lineHeight: 1 }}>{c.emoji}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t(c.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════════ */}
      <section className="relative z-10 page-container pb-16">
        <div className="divider" />
        <div style={{ marginTop: '40px', textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: '9999px',
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
            fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>{t('home.how_section_tag')}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {t('home.how_section_title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {t('home.how_section_subtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', position: 'relative' }}>
          {/* Connector line (desktop) */}
          <div style={{
            position: 'absolute', top: '52px', left: '20%', right: '20%', height: '2px',
            background: 'linear-gradient(90deg, rgba(16,185,129,0.4), rgba(139,92,246,0.4), rgba(245,158,11,0.4))',
            display: 'none',
          }} className="md:block" />

          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
              {/* Step number ring */}
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px',
                background: `linear-gradient(135deg, ${step.color.split(' ')[1]?.replace('to-', '') || '#10b981'}, ${step.color.split(' ')[3] || '#34d399'})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', boxShadow: `0 8px 24px ${step.glow}`,
              }}>
                {step.icon}
              </div>
              <div style={{
                position: 'absolute', top: '16px', right: '20px',
                fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
                letterSpacing: '0.08em',
              }}>STEP {step.step}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>{step.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES GRID ═════════════════════════════════════════ */}
      <section className="relative z-10 page-container pb-16">
        <div className="divider" />
        <div style={{ marginTop: '40px', textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: '9999px',
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
            fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>{t('home.features_section_tag')}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {t('home.features_section_title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {t('home.features_section_subtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card" style={{ padding: '28px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                  background: `linear-gradient(135deg, ${f.color.includes('emerald') ? '#10b981, #14b8a6' :
                      f.color.includes('amber') ? '#f59e0b, #f97316' :
                        f.color.includes('purple') ? '#8b5cf6, #ec4899' :
                          f.color.includes('cyan') ? '#06b6d4, #3b82f6' :
                            f.color.includes('rose') ? '#f43f5e, #ec4899' :
                              f.color.includes('lime') ? '#84cc16, #4ade80' :
                                f.color.includes('orange') ? '#f97316, #ef4444' :
                                  '#64748b, #94a3b8'
                    })`,
                }}>
                  {f.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{f.title}</h3>
                  </div>
                  <span style={{
                    display: 'inline-block', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em',
                    padding: '2px 8px', borderRadius: '9999px',
                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                    color: '#34d399', marginBottom: '8px',
                  }}>{f.tag}</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════ */}
      <section className="relative z-10 page-container pb-16">
        <div className="divider" />
        <div style={{ marginTop: '40px', textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: '9999px',
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
            fontSize: '0.75rem', fontWeight: 600, color: '#fb7185', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>{t('home.testimonials_section_tag')}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {t('home.testimonials_section_title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {t('home.testimonials_section_subtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {TESTIMONIALS.map((t_item) => (
            <div key={t_item.name} className="glass-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Quote mark */}
              <div style={{ fontSize: '2.5rem', lineHeight: 1, color: 'rgba(52,211,153,0.3)', fontFamily: 'Georgia, serif' }}>"</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '-16px', flex: 1 }}>
                {t_item.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border-soft)', paddingTop: '16px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%', fontSize: '1.5rem',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1))',
                  border: '2px solid rgba(52,211,153,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {t_item.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t_item.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t_item.role}</p>
                </div>
                <Stars count={t_item.stars} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA BANNER ════════════════════════════════════════════ */}
      <section className="relative z-10 page-container pb-20">
        <div style={{
          borderRadius: '1.5rem',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(245,158,11,0.08) 100%)',
          border: '1px solid rgba(52,211,153,0.2)',
          padding: 'clamp(32px, 5vw, 56px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background glow */}
          <div style={{
            position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍽️</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              {t('home.cta_title_1')}{' '}
              <span className="gradient-text">{t('home.cta_title_2')}</span>?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
              {t('home.cta_subtitle')}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => document.getElementById('ingredient-search')?.scrollIntoView({ behavior: 'smooth' }) || window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="btn-primary"
                style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {t('home.cta_search')}
              </button>
              <Link
                href="/register"
                className="btn-outline"
                style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
              >
                {t('home.cta_register')}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
