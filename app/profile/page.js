'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/* ── Avatar initials helper ─────────────────────────────────── */
function Avatar({ name, size = 'lg' }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const sizes = { sm: 'w-10 h-10 text-sm', md: 'w-16 h-16 text-xl', lg: 'w-24 h-24 text-3xl' }
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-white shadow-xl shadow-emerald-900/40 flex-shrink-0`}>
      {initials}
    </div>
  )
}

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({ icon, value, label, href }) {
  const inner = (
    <div className="glass-card p-5 text-center group cursor-pointer hover:border-emerald-400/40 transition-all">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-2xl font-black gradient-text">{value}</p>
      <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

/* ── Input Field ─────────────────────────────────────────────── */
function Field({ label, id, type = 'text', value, onChange, placeholder, disabled, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-300">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="input-field"
      />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

/* ── Toast ───────────────────────────────────────────────────── */
function InlineToast({ msg, type }) {
  if (!msg) return null
  const colors = {
    success: 'bg-emerald-900/80 border-emerald-500/40 text-emerald-200',
    error:   'bg-red-900/80 border-red-500/40 text-red-200',
    info:    'bg-blue-900/80 border-blue-500/40 text-blue-200',
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${colors[type]}`}>
      <span>{icons[type]}</span>
      <span>{msg}</span>
    </div>
  )
}

/* ── Main Profile Page ───────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser]     = useState(null)
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Edit name state
  const [name, setName]     = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState(null)

  // Change password state
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw]   = useState(false)
  const [pwMsg, setPwMsg]         = useState(null)
  const [showPw, setShowPw]       = useState(false)

  // Active tab
  const [tab, setTab] = useState('overview')

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setUser(data.user)
      setStats(data.stats)
      setName(data.user.name)
    } catch {
      // network error — stay on page
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleSaveName = async (e) => {
    e.preventDefault()
    if (!name.trim() || name.trim() === user?.name) {
      setNameMsg({ type: 'info', msg: 'No changes to save.' })
      return
    }
    setSavingName(true)
    setNameMsg(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        setNameMsg({ type: 'success', msg: 'Name updated successfully!' })
      } else {
        setNameMsg({ type: 'error', msg: data.error || 'Failed to update name.' })
      }
    } catch {
      setNameMsg({ type: 'error', msg: 'Network error. Please try again.' })
    } finally {
      setSavingName(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwMsg(null)
    if (newPw !== confirmPw) { setPwMsg({ type: 'error', msg: 'New passwords do not match.' }); return }
    if (newPw.length < 6)    { setPwMsg({ type: 'error', msg: 'Password must be at least 6 characters.' }); return }
    setSavingPw(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (res.ok) {
        setPwMsg({ type: 'success', msg: 'Password changed successfully!' })
        setCurrentPw(''); setNewPw(''); setConfirmPw('')
      } else {
        setPwMsg({ type: 'error', msg: data.error || 'Failed to change password.' })
      }
    } catch {
      setPwMsg({ type: 'error', msg: 'Network error. Please try again.' })
    } finally {
      setSavingPw(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  /* ── Loading skeleton ───────────────────────────────────────── */
  if (loading) {
    return (
      <div className="hero-bg min-h-screen">
        <div className="page-container max-w-3xl mx-auto">
          <div className="skeleton h-8 w-40 rounded-xl mb-8" />
          <div className="glass-card p-8 mb-6">
            <div className="flex items-center gap-6">
              <div className="skeleton w-24 h-24 rounded-full" />
              <div className="flex flex-col gap-3 flex-1">
                <div className="skeleton h-6 w-48 rounded-lg" />
                <div className="skeleton h-4 w-64 rounded-lg" />
                <div className="skeleton h-4 w-32 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const TABS = [
    { id: 'overview',  label: '👤 Overview' },
    { id: 'edit',      label: '✏️ Edit Profile' },
    ...(user.googleId ? [] : [{ id: 'password', label: '🔒 Password' }]),
  ]

  return (
    <div className="hero-bg min-h-screen">
      <div className="page-container max-w-3xl mx-auto">

        {/* ── Hero card ─────────────────────────────────────────── */}
        <div className="glass-card p-8 mb-6 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar name={user.name} size="lg" />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-100">{user.name}</h1>
                {user.googleId && (
                  <span className="badge badge-emerald text-xs">🔗 Google</span>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-1">{user.email}</p>
              <p className="text-slate-600 text-xs">Member since {joinDate}</p>

              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                <Link href="/watch-later" className="btn-outline text-xs py-1.5 px-3">
                  ⭐ Watch Later
                </Link>
                <Link href="/history" className="btn-outline text-xs py-1.5 px-3">
                  🕒 History
                </Link>
                <button onClick={handleLogout} className="btn-danger text-xs py-1.5 px-3 rounded-xl">
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard icon="🔍" value={stats.searchCount} label="Searches"       href="/history" />
            <StatCard icon="⭐" value={stats.savedCount}  label="Saved Recipes"  href="/watch-later" />
            <StatCard icon="🎬" value={stats.videoCount}  label="Saved Videos"   href="/videos" />
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div className="glass-card overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-800">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Overview Tab ──────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="p-6 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-slate-200 mb-1">Account Information</h2>
              {[
                { label: 'Full Name',    value: user.name },
                { label: 'Email',        value: user.email },
                { label: 'Member Since', value: joinDate },
                { label: 'Account Type', value: user.googleId ? 'Google Sign-In' : 'Email & Password' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-3 border-b border-slate-800/60 last:border-0">
                  <span className="text-sm text-slate-500 font-medium">{label}</span>
                  <span className="text-sm text-slate-200 font-semibold">{value}</span>
                </div>
              ))}

              <div className="mt-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-xs text-emerald-300 font-medium mb-1">🍽️ Your RecipeMate Activity</p>
                <p className="text-xs text-slate-400">
                  You&apos;ve made <strong className="text-slate-200">{stats?.searchCount || 0}</strong> searches,
                  saved <strong className="text-slate-200">{stats?.savedCount || 0}</strong> recipes,
                  and bookmarked <strong className="text-slate-200">{stats?.videoCount || 0}</strong> cooking videos.
                </p>
              </div>
            </div>
          )}

          {/* ── Edit Tab ──────────────────────────────────────────── */}
          {tab === 'edit' && (
            <div className="p-6">
              <h2 className="text-base font-semibold text-slate-200 mb-4">Edit Your Profile</h2>
              <form onSubmit={handleSaveName} className="flex flex-col gap-4">
                <Field
                  label="Full Name"
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  disabled={savingName}
                />
                <Field
                  label="Email Address"
                  id="profile-email"
                  type="email"
                  value={user.email}
                  disabled
                  hint="Email cannot be changed. Contact support if needed."
                />
                <InlineToast {...(nameMsg || {})} msg={nameMsg?.msg} type={nameMsg?.type} />
                <button
                  type="submit"
                  disabled={savingName || !name.trim()}
                  className="btn-primary py-2.5 disabled:opacity-50 w-full sm:w-auto sm:self-start px-8"
                >
                  {savingName ? 'Saving…' : '💾 Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* ── Password Tab ──────────────────────────────────────── */}
          {tab === 'password' && !user.googleId && (
            <div className="p-6">
              <h2 className="text-base font-semibold text-slate-200 mb-1">Change Password</h2>
              <p className="text-xs text-slate-500 mb-5">Choose a strong password with at least 6 characters.</p>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <Field
                  label="Current Password"
                  id="current-pw"
                  type={showPw ? 'text' : 'password'}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Enter your current password"
                  disabled={savingPw}
                />
                <Field
                  label="New Password"
                  id="new-pw"
                  type={showPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={savingPw}
                />
                <Field
                  label="Confirm New Password"
                  id="confirm-pw"
                  type={showPw ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  disabled={savingPw}
                />
                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPw}
                    onChange={() => setShowPw((v) => !v)}
                    className="rounded"
                  />
                  Show passwords
                </label>
                <InlineToast {...(pwMsg || {})} msg={pwMsg?.msg} type={pwMsg?.type} />
                <button
                  type="submit"
                  disabled={savingPw || !currentPw || !newPw || !confirmPw}
                  className="btn-primary py-2.5 disabled:opacity-50 w-full sm:w-auto sm:self-start px-8"
                >
                  {savingPw ? 'Updating…' : '🔒 Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── Danger zone ───────────────────────────────────────── */}
        <div className="mt-6 glass-card p-6 border-red-500/10">
          <h3 className="text-sm font-semibold text-red-400 mb-1">Danger Zone</h3>
          <p className="text-xs text-slate-500 mb-4">These actions are permanent and cannot be undone.</p>
          <button
            onClick={handleLogout}
            className="btn-danger text-sm px-5 py-2"
          >
            🚪 Sign Out of Account
          </button>
        </div>

        <div className="h-10" />
      </div>
    </div>
  )
}
