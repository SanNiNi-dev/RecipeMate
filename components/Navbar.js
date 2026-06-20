'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

/* ── SVG Icons ──────────────────────────────────────────────── */
const SunIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 15a5 5 0 100-10 5 5 0 000 10zm7.071-12.071a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM21 11a1 1 0 110 2h-1a1 1 0 110-2h1zm-3.636 6.364a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM12 20a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-6.364-3.636a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM4 11a1 1 0 110 2H3a1 1 0 110-2h1zm1.636-6.364a1 1 0 011.414 1.414l-.707.707A1 1 0 014.929 5.343l.707-.707z" />
  </svg>
)

const MoonIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
)



const MODES = [
  { id: 'light',  label: 'Light',  Icon: SunIcon },
  { id: 'dark',   label: 'Dark',   Icon: MoonIcon },
]

/* ── Theme Toggle Pill (shared between desktop + mobile) ──── */
function ThemePill({ compact = false }) {
  const { mode, setMode } = useTheme()

  return (
    <div
      role="group"
      aria-label="Theme selector"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '3px',
        borderRadius: '10px',
        background: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.18)',
      }}
    >
      {MODES.map(({ id, label, Icon }) => {
        const active = mode === id
        return (
          <button
            key={id}
            id={`theme-mode-${id}`}
            onClick={() => setMode(id)}
            aria-label={`${label} mode`}
            aria-pressed={active}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: compact ? '0' : '5px',
              padding: compact ? '5px 7px' : '5px 10px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              transition: 'all 0.2s ease',
              background: active
                ? id === 'light'
                  ? 'rgba(251,191,36,0.18)'
                  : id === 'dark'
                    ? 'rgba(99,102,241,0.22)'
                    : 'rgba(16,185,129,0.18)'
                : 'transparent',
              color: active
                ? id === 'light'
                  ? '#f59e0b'
                  : id === 'dark'
                    ? '#818cf8'
                    : '#10b981'
                : 'var(--text-muted)',
              boxShadow: active ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
              transform: active ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            <Icon />
            {!compact && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser, pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
    router.refresh()
  }

  const isActive = (href) => pathname === href

  const linkClass = (href) =>
    `relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(href)
        ? 'text-emerald-400 bg-emerald-400/10'
        : 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-400/8'
    }`

  return (
    <nav className="glass sticky top-0 z-50 border-b border-emerald-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300">
              <span className="text-lg">🍽️</span>
            </div>
            <span className="text-lg font-bold gradient-text font-['Playfair_Display',serif]">
              RecipeMate
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={linkClass('/')}>Home</Link>
            <Link href="/videos" className={linkClass('/videos')}>
              🎬 Videos
            </Link>
            {!loading && user && (
              <>
                <Link href="/history" className={linkClass('/history')}>History</Link>
                <Link href="/watch-later" className={linkClass('/watch-later')}>
                  ⭐ Watch Later
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive('/admin')
                        ? 'text-rose-400 bg-rose-400/10'
                        : 'text-rose-400/80 hover:text-rose-400 hover:bg-rose-400/8'
                    }`}
                  >
                    ⚙️ Admin
                  </Link>
                )}
              </>
            )}
            {!loading && !user && (
              <>
                <Link href="/login" className={linkClass('/login')}>Login</Link>
                <Link
                  href="/register"
                  className="ml-2 px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Right Section (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* 3-way theme pill */}
            <ThemePill />

            {!loading && user && (
              <>
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    isActive('/profile')
                      ? 'bg-emerald-400/15 border border-emerald-400/30'
                      : 'bg-emerald-400/8 border border-emerald-400/20 hover:bg-emerald-400/15'
                  }`}
                  title="View your profile"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-emerald-300">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-danger text-xs px-3 py-1.5"
                >
                  Logout
                </button>
              </>
            )}
            {loading && (
              <div className="w-24 h-8 skeleton rounded-lg" />
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-emerald-900/30 px-4 py-4 flex flex-col gap-2">
          <Link href="/" className={linkClass('/')} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/videos" className={linkClass('/videos')} onClick={() => setMenuOpen(false)}>🎬 Cooking Videos</Link>
          {!loading && user && (
            <>
              <Link href="/history" className={linkClass('/history')} onClick={() => setMenuOpen(false)}>Search History</Link>
              <Link href="/watch-later" className={linkClass('/watch-later')} onClick={() => setMenuOpen(false)}>⭐ Watch Later</Link>
              <Link href="/profile" className={linkClass('/profile')} onClick={() => setMenuOpen(false)}>👤 My Profile</Link>
              {user.isAdmin && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/admin') ? 'text-rose-400 bg-rose-400/10' : 'text-rose-400/80 hover:text-rose-400 hover:bg-rose-400/8'
                }`}>⚙️ Admin Panel</Link>
              )}
              <div className="flex items-center gap-3 pt-2 border-t border-emerald-900/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-sm font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-emerald-300 font-medium">{user.name}</span>
                <button onClick={handleLogout} className="ml-auto btn-danger text-xs px-3 py-1.5">Logout</button>
              </div>
            </>
          )}
          {!loading && !user && (
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center btn-outline py-2">Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center btn-primary py-2 rounded-xl">Register</Link>
            </div>
          )}

          {/* Theme pill in mobile — full labels */}
          <div className="pt-3 border-t border-emerald-900/30">
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Appearance
            </p>
            <ThemePill />
          </div>
        </div>
      )}
    </nav>
  )
}
