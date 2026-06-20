'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({ icon, value, label, sub, color = 'emerald' }) {
  const colors = {
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
    violet:  'from-violet-500/20  to-violet-600/5  border-violet-500/20',
    amber:   'from-amber-500/20   to-amber-600/5   border-amber-500/20',
    rose:    'from-rose-500/20    to-rose-600/5    border-rose-500/20',
    blue:    'from-blue-500/20    to-blue-600/5    border-blue-500/20',
  }
  return (
    <div className={`glass-card p-5 bg-gradient-to-br ${colors[color] || colors.emerald} flex flex-col gap-1`}>
      <div className="text-3xl mb-1">{icon}</div>
      <p className="text-2xl font-black text-slate-100">{value ?? '—'}</p>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      {sub && <p className="text-xs text-emerald-400 font-semibold">{sub}</p>}
    </div>
  )
}

/* ── Avatar initials ─────────────────────────────────────────── */
function Avatar({ name, size = 'sm' }) {
  const initials = name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?'
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {initials}
    </div>
  )
}

/* ── Confirm Dialog ──────────────────────────────────────────── */
function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass-card p-6 max-w-sm w-full z-10 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-outline text-sm px-4 py-2">Cancel</button>
          <button
            onClick={onConfirm}
            className={danger ? 'btn-danger text-sm px-4 py-2' : 'btn-primary text-sm px-4 py-2'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Toast notification ──────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className="fixed top-20 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-xl border text-sm font-medium shadow-xl backdrop-blur-md toast-enter ${
            t.type === 'success'
              ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100'
              : 'bg-red-900/90 border-red-500/50 text-red-100'
          }`}
        >
          {t.type === 'success' ? '✅' : '❌'} {t.msg}
        </div>
      ))}
    </div>
  )
}

/* ── Main Admin Page ─────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter()

  const [adminUser, setAdminUser]   = useState(null)
  const [stats, setStats]           = useState(null)
  const [users, setUsers]           = useState([])
  const [total, setTotal]           = useState(0)
  const [pages, setPages]           = useState(1)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading]       = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [toasts, setToasts]         = useState([])
  const [confirm, setConfirm]       = useState(null) // { type, userId, userName }

  const addToast = (msg, type = 'success') => {
    const id = Date.now()
    setToasts((p) => [...p, { id, msg, type }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500)
  }

  /* ── Check auth + fetch stats ──────────────────────────────── */
  useEffect(() => {
    const init = async () => {
      try {
        const meRes = await fetch('/api/auth/me')
        if (!meRes.ok) { router.push('/login'); return }
        const meData = await meRes.json()

        const statsRes = await fetch('/api/admin/stats')
        if (statsRes.status === 403) { router.push('/'); return }
        if (!statsRes.ok) throw new Error('stats failed')

        setAdminUser(meData.user)
        setStats(await statsRes.json())
      } catch {
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  /* ── Fetch users ───────────────────────────────────────────── */
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), search })
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.total)
      setPages(data.pages)
    } catch {
      addToast('Failed to load users.', 'error')
    } finally {
      setUsersLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    if (!loading) fetchUsers()
  }, [loading, fetchUsers])

  /* ── Toggle admin ──────────────────────────────────────────── */
  const handleToggleAdmin = async (userId, currentIsAdmin) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentIsAdmin }),
      })
      const data = await res.json()
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isAdmin: !currentIsAdmin } : u))
        addToast(data.message)
      } else {
        addToast(data.error || 'Failed to update.', 'error')
      }
    } catch {
      addToast('Network error.', 'error')
    }
    setConfirm(null)
  }

  /* ── Delete user ───────────────────────────────────────────── */
  const handleDelete = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setTotal((t) => t - 1)
        addToast('User deleted successfully.')
      } else {
        addToast(data.error || 'Failed to delete.', 'error')
      }
    } catch {
      addToast('Network error.', 'error')
    }
    setConfirm(null)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  /* ── Loading ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="hero-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading admin panel…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="hero-bg min-h-screen">
      <Toast toasts={toasts} />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.type === 'delete' ? '🗑️ Delete User' : confirm?.isAdmin ? '⬇️ Revoke Admin' : '⬆️ Grant Admin'}
        message={
          confirm?.type === 'delete'
            ? `Permanently delete "${confirm?.userName}" and all their data? This cannot be undone.`
            : confirm?.isAdmin
              ? `Remove admin rights from "${confirm?.userName}"?`
              : `Grant admin access to "${confirm?.userName}"? They will have full admin panel access.`
        }
        confirmLabel={confirm?.type === 'delete' ? 'Delete User' : confirm?.isAdmin ? 'Revoke Admin' : 'Grant Admin'}
        danger={confirm?.type === 'delete'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === 'delete') handleDelete(confirm.userId)
          else handleToggleAdmin(confirm.userId, confirm.isAdmin)
        }}
      />

      <div className="page-container max-w-6xl mx-auto">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 uppercase tracking-widest">
                Admin Panel
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-100">Management Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Logged in as <span className="text-emerald-400 font-semibold">{adminUser?.name}</span></p>
          </div>
          <button onClick={() => router.push('/')} className="btn-outline text-sm px-4 py-2">
            ← Back to App
          </button>
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard icon="👥" value={stats.totalUsers}    label="Total Users"    sub={`+${stats.newUsersThisWeek} this week`} color="emerald" />
            <StatCard icon="🔍" value={stats.totalSearches}  label="Total Searches" color="violet" />
            <StatCard icon="⭐" value={stats.totalSaved}     label="Saved Recipes"  color="amber" />
            <StatCard icon="🎬" value={stats.totalVideos}    label="Saved Videos"   color="blue" />
            <StatCard icon="📈" value={`${stats.newUsersThisWeek}`} label="New This Week" color="rose" />
          </div>
        )}

        {/* ── Recent Activity ─────────────────────────────────── */}
        {stats?.recentSearches?.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">🕒 Recent Searches</h2>
            <div className="flex flex-wrap gap-2">
              {stats.recentSearches.map((s) => (
                <span key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
                  <span className="text-emerald-400 font-medium">{s.user.name.split(' ')[0]}</span>
                  searched
                  <span className="text-slate-200 font-medium">&quot;{s.searchText}&quot;</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Users Table ─────────────────────────────────────── */}
        <div className="glass-card overflow-hidden">
          {/* Table header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-200">All Users</h2>
              <p className="text-xs text-slate-500 mt-0.5">{total} user{total !== 1 ? 's' : ''} total</p>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or email…"
                className="input-field text-sm py-2 px-3 w-56"
              />
              <button type="submit" className="btn-primary text-sm px-4 py-2">Search</button>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
                  className="btn-outline text-sm px-3 py-2"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Table body */}
          {usersLoading ? (
            <div className="p-8 flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="skeleton w-8 h-8 rounded-full" />
                  <div className="skeleton h-4 flex-1 rounded-lg" />
                  <div className="skeleton h-4 w-32 rounded-lg" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-3">👤</div>
              <p className="text-slate-400">No users found{search ? ` matching "${search}"` : ''}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    {['User', 'Email', 'Role', 'Activity', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} />
                          <div>
                            <p className="text-sm font-semibold text-slate-200 leading-tight">{u.name}</p>
                            {u.googleId && <span className="text-xs text-emerald-500">Google</span>}
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-400">{u.email}</span>
                      </td>
                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className={`badge text-xs ${u.isAdmin ? 'badge-emerald' : 'badge-amber'}`}>
                          {u.isAdmin ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      {/* Activity */}
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span title="Searches">🔍 {u._count.searchHistory}</span>
                          <span title="Saved recipes">⭐ {u._count.watchLater}</span>
                          <span title="Videos">🎬 {u._count.savedVideos}</span>
                        </div>
                      </td>
                      {/* Joined */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirm({ type: 'admin', userId: u.id, userName: u.name, isAdmin: u.isAdmin })}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium ${
                              u.isAdmin
                                ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                                : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                          >
                            {u.isAdmin ? '⬇️ Revoke' : '⬆️ Make Admin'}
                          </button>
                          <button
                            onClick={() => setConfirm({ type: 'delete', userId: u.id, userName: u.name })}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-medium"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      page === i + 1
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                        : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-10" />
      </div>
    </div>
  )
}
