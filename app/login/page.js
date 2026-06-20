'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ToastContainer, useToast } from '@/components/Toast'

/* Google "G" logo SVG */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.68 14.62 48 24 48z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.16C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.32 2.56 13.22l7.98 6.16C12.43 13.72 17.74 9.5 24 9.5z" />
  </svg>
)

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toasts, addToast, removeToast } = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'google_denied') addToast('Google sign-in was cancelled.', 'error')
    else if (error === 'google_failed') addToast('Google sign-in failed. Please try again.', 'error')
    else if (error === 'no_email') addToast('Could not retrieve your Google email.', 'error')
  }, [searchParams, addToast])

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required.'
    if (!form.password) e.password = 'Password is required.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (res.ok) {
        addToast(`Welcome back, ${data.user?.name || 'Chef'}! 🍳`, 'success')
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1200)
      } else {
        addToast(data.error || 'Invalid credentials.', 'error')
      }
    } catch {
      addToast('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setGoogleLoading(true)
    window.location.href = '/api/auth/google'
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  return (
    <div className="hero-bg min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="orb w-80 h-80 bg-emerald-500/10 top-32 -right-24" style={{ animationDelay: '1s' }} />
        <div className="orb w-64 h-64 bg-amber-500/5 bottom-32 -left-20" style={{ animationDelay: '4s' }} />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
              <span className="text-3xl">🔑</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h1>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              Sign in to your RecipeMate account
            </p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1 text-base">
                {loading ? 'Signing In…' : 'Sign In'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(52,211,153,0.15)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                or continue with
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(52,211,153,0.15)' }} />
            </div>

            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(52,211,153,0.25)',
                background: 'var(--glass-card)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: googleLoading ? 'not-allowed' : 'pointer',
                opacity: googleLoading ? 0.7 : 1,
                transition: 'all 0.22s ease',
                marginBottom: '1.5rem',
              }}
            >
              {googleLoading ? 'Redirecting…' : <><GoogleIcon /> Continue with Google</>}
            </button>

            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              New to RecipeMate?{' '}
              <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}