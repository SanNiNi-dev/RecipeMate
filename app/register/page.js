'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ToastContainer, useToast } from '@/components/Toast'

/* Google "G" logo SVG */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.68 14.62 48 24 48z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.16C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.32 2.56 13.22l7.98 6.16C12.43 13.72 17.74 9.5 24 9.5z"/>
  </svg>
)

export default function RegisterPage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.password) e.password = 'Password is required.'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        addToast('Account created! Redirecting to login…', 'success')
        setTimeout(() => router.push('/login'), 1800)
      } else {
        addToast(data.error || 'Registration failed.', 'error')
      }
    } catch {
      addToast('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleGoogleSignIn = () => {
    setGoogleLoading(true)
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="hero-bg min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        {/* Background orbs */}
        <div className="orb w-96 h-96 bg-emerald-500/10 top-20 -left-32" style={{ animationDelay: '0s' }} />
        <div className="orb w-72 h-72 bg-amber-500/5 bottom-20 -right-24" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
              <span className="text-3xl">👨‍🍳</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Start discovering recipes tailored to your kitchen</p>
          </div>

          {/* Card */}
          <div className="glass-card p-8">

            {/* ── Email / Password form (top) ── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {/* Name */}
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Gordon Ramsay"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="gordon@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 mt-1 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account…
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            {/* ── Divider ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(52,211,153,0.15)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                or continue with
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(52,211,153,0.15)' }} />
            </div>

            {/* ── Google Sign-Up (bottom) ── */}
            <button
              id="google-register-btn"
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
              onMouseEnter={e => { if (!googleLoading) { e.currentTarget.style.borderColor = 'rgba(66,133,244,0.5)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(66,133,244,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(52,211,153,0.25)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {googleLoading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <GoogleIcon />
              )}
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
