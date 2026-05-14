import { useState } from 'react'

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!pin) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid PIN'); return }
      onLogin(data)
    } catch {
      setError('Connection error — is the server running?')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (p) => { setPin(p); setError('') }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(245,197,24,0.06) 0%, transparent 65%), var(--black)',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }} className="fade-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontSize: 52,
            lineHeight: 1,
            marginBottom: 12,
            filter: 'drop-shadow(0 0 20px rgba(245,197,24,0.4))',
          }}>🚕</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            TAXI<span style={{ color: 'var(--yellow)' }}>MGR</span>
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Real-time dispatch
          </p>
        </div>

        <div className="card" style={{ borderColor: 'var(--border-light)' }}>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Enter your PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••"
                value={pin}
                onChange={e => { setPin(e.target.value); setError('') }}
                style={{ fontSize: 24, letterSpacing: '0.3em', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                autoFocus
              />
            </div>

            {error && (
              <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 14, fontFamily: 'var(--font-mono)' }}>
                ⚠ {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading || !pin}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Quick login hints */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Quick login (demo)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '👑 Owner', pin: '0000' },
                { label: '🚗 Ahmed', pin: '1111' },
                { label: '🚗 Mohammed', pin: '2222' },
                { label: '🚗 Khalid', pin: '3333' },
              ].map(u => (
                <button
                  key={u.pin}
                  className="btn btn-ghost btn-sm"
                  onClick={() => quickLogin(u.pin)}
                  style={{ justifyContent: 'center' }}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
