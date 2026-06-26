'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTheme } from './ThemeProvider'

// ── Markdown-lite renderer ────────────────────────────────────────────────────
function renderMarkdown(text) {
  return text
    // Bold **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic *text*
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Bullet points: lines starting with •  or -
    .replace(/^[•\-]\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    // Line breaks
    .replace(/\n/g, '<br/>')
}

// ── Single message bubble ─────────────────────────────────────────────────────
function MessageBubble({ msg, isDark }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-sm flex-shrink-0 shadow-md">
          🍳
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-br-sm'
            : ''
        }`}
        style={
          !isUser
            ? {
                background: isDark
                  ? 'rgba(30, 41, 59, 0.9)'
                  : 'rgba(240, 253, 244, 0.95)',
                border: isDark
                  ? '1px solid rgba(52,211,153,0.15)'
                  : '1px solid rgba(16,185,129,0.25)',
                color: isDark ? '#e2e8f0' : '#0f172a',
                borderRadius: '1rem 1rem 1rem 0.25rem',
              }
            : {}
        }
      >
        {msg.isStreaming ? (
          <span>
            <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
            <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-0.5 animate-pulse rounded-sm" />
          </span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
        )}
      </div>
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator({ isDark }) {
  return (
    <div className="flex gap-2.5 items-end">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-sm flex-shrink-0 shadow-md">
        🍳
      </div>
      <div
        className="rounded-2xl rounded-bl-sm px-4 py-3"
        style={{
          background: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(240, 253, 244, 0.95)',
          border: isDark
            ? '1px solid rgba(52,211,153,0.15)'
            : '1px solid rgba(16,185,129,0.25)',
        }}
      >
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Suggested prompts ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  '🍕 Quick pasta recipe?',
  '🥗 Healthy dinner ideas',
  '🔄 Substitute for eggs?',
  '🌶️ Tips for spicy food',
]

// ── Main ChatBot component ────────────────────────────────────────────────────
export default function ChatBot() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey there! 👋 I'm **Chef Mate**, your AI cooking assistant.\n\nAsk me anything — recipes, substitutions, nutrition tips, or techniques!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [noKey, setNoKey] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput('')
    setError('')

    const userMsg = { id: Date.now() + '-u', role: 'user', content: userText }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setLoading(true)

    const assistantId = Date.now() + '-a'

    try {
      abortRef.current = new AbortController()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 503) setNoKey(true)
        throw new Error(data.error || 'Request failed')
      }

      // Stream the response
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', isStreaming: true },
      ])
      setLoading(false)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') break
          try {
            const { text, error: streamErr } = JSON.parse(payload)
            if (streamErr) throw new Error(streamErr)
            if (text) {
              accumulated += text
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accumulated } : m
                )
              )
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      // Mark streaming done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      )
    } catch (err) {
      if (err.name === 'AbortError') return
      setLoading(false)
      setError(err.message || 'Something went wrong.')
      // Remove optimistic streaming bubble if it was added
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
    }
  }, [input, loading, messages])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    abortRef.current?.abort()
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hey there! 👋 I'm **Chef Mate**, your AI cooking assistant.\n\nAsk me anything — recipes, substitutions, nutrition tips, or techniques!",
      },
    ])
    setError('')
    setLoading(false)
    setNoKey(false)
  }

  // ── Theme-aware style tokens ──────────────────────────────────────────────
  const windowBg = isDark
    ? 'rgba(10, 17, 35, 0.97)'
    : 'rgba(255, 255, 255, 0.97)'

  const windowBorder = isDark
    ? '1px solid rgba(52, 211, 153, 0.2)'
    : '1px solid rgba(16, 185, 129, 0.3)'

  const windowShadow = isDark
    ? '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(52,211,153,0.1)'
    : '0 25px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(16,185,129,0.15)'

  const headerBg = isDark
    ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))'
    : 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))'

  const headerBorder = isDark
    ? '1px solid rgba(52,211,153,0.15)'
    : '1px solid rgba(16,185,129,0.2)'

  const titleColor = isDark ? '#f1f5f9' : '#0f172a'
  const iconBtnColor = isDark ? '#64748b' : '#94a3b8'
  const iconBtnHoverStyle = isDark ? 'rgba(51,65,85,0.5)' : 'rgba(16,185,129,0.1)'

  const inputBg = isDark
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(248, 250, 252, 0.95)'

  const inputBorder = isDark
    ? '1px solid rgba(71,85,105,0.5)'
    : '1px solid rgba(16,185,129,0.25)'

  const inputColor = isDark ? '#e2e8f0' : '#0f172a'
  const inputPlaceholder = isDark ? '#64748b' : '#94a3b8'

  const inputBarBorder = isDark
    ? '1px solid rgba(52,211,153,0.12)'
    : '1px solid rgba(16,185,129,0.15)'

  const suggestionBorder = isDark ? 'rgba(71,85,105,0.6)' : 'rgba(16,185,129,0.3)'
  const suggestionColor = isDark ? '#94a3b8' : '#475569'

  return (
    <>
      {/* ── Floating toggle button ─────────────────────────────────────────── */}
      <button
        id="chatbot-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open Chef Mate AI'}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group"
        style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          boxShadow: open
            ? '0 0 0 3px rgba(16,185,129,0.4), 0 8px 30px rgba(16,185,129,0.5)'
            : '0 8px 30px rgba(16,185,129,0.35)',
        }}
      >
        <span
          className="text-2xl transition-transform duration-300"
          style={{ transform: open ? 'rotate(90deg) scale(0.85)' : 'scale(1)' }}
        >
          {open ? '✕' : '🍳'}
        </span>
        {/* Pulse ring (only when closed) */}
        {!open && (
          <span className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping" />
        )}
      </button>

      {/* ── Chat window ───────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-24 right-6 z-[99] flex flex-col transition-all duration-300 origin-bottom-right"
        style={{
          width: 'min(380px, calc(100vw - 24px))',
          height: '520px',
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(12px)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div
          className="flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: windowBg,
            backdropFilter: 'blur(20px)',
            border: windowBorder,
            boxShadow: windowShadow,
            transition: 'background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{
              background: headerBg,
              borderBottom: headerBorder,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-lg shadow-lg">
                🍳
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: titleColor }}>Chef Mate</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-500 font-medium">AI Cooking Assistant</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1.5 rounded-lg transition-all"
                style={{ color: iconBtnColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = iconBtnHoverStyle
                  e.currentTarget.style.color = isDark ? '#cbd5e1' : '#0f172a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = iconBtnColor
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: iconBtnColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = iconBtnHoverStyle
                  e.currentTarget.style.color = isDark ? '#cbd5e1' : '#0f172a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = iconBtnColor
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* No API key banner */}
          {noKey && (
            <div
              className="mx-3 mt-3 px-3 py-2 rounded-xl flex-shrink-0 text-xs"
              style={{
                background: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.3)',
                color: isDark ? '#fcd34d' : '#92400e',
              }}
            >
              ⚠️ Add <code
                className="px-1 rounded"
                style={{ background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)' }}
              >GROQ_API_KEY</code> to your{' '}
              <code
                className="px-1 rounded"
                style={{ background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)' }}
              >.env</code> file.{' '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
                style={{ color: isDark ? '#fbbf24' : '#b45309' }}
              >
                Get free key →
              </a>
            </div>
          )}

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 scroll-smooth"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#065f46 transparent' }}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} isDark={isDark} />
            ))}
            {loading && <TypingIndicator isDark={isDark} />}
            {error && (
              <div
                className="text-xs rounded-xl px-3 py-2 text-center"
                style={{
                  color: isDark ? '#f87171' : '#dc2626',
                  background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.25)',
                }}
              >
                ⚠️ {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts (only on first interaction) */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-2.5 py-1.5 rounded-full transition-all duration-200"
                  style={{
                    border: `1px solid ${suggestionBorder}`,
                    color: suggestionColor,
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'
                    e.currentTarget.style.color = '#10b981'
                    e.currentTarget.style.background = 'rgba(16,185,129,0.06)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = suggestionBorder
                    e.currentTarget.style.color = suggestionColor
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div
            className="flex items-end gap-2 px-3 py-3 flex-shrink-0"
            style={{ borderTop: inputBarBorder }}
          >
            <textarea
              ref={inputRef}
              id="chatbot-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                // Auto-resize
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about recipes, tips, substitutes…"
              rows={1}
              disabled={loading}
              className="flex-1 rounded-xl px-3 py-2 text-sm resize-none outline-none transition-all duration-200 disabled:opacity-50"
              style={{
                background: inputBg,
                border: inputBorder,
                color: inputColor,
                minHeight: '38px',
                maxHeight: '100px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(16,185,129,0.6)'
                e.target.style.boxShadow = '0 0 0 2px rgba(16,185,129,0.12)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDark
                  ? 'rgba(71,85,105,0.5)'
                  : 'rgba(16,185,129,0.25)'
                e.target.style.boxShadow = 'none'
              }}
            />
            {/* placeholder color shim */}
            <style>{`#chatbot-input::placeholder { color: ${inputPlaceholder}; }`}</style>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              id="chatbot-send"
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: !input.trim() || loading
                  ? isDark ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: !input.trim() || loading ? 'none' : '0 4px 15px rgba(16,185,129,0.3)',
              }}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
