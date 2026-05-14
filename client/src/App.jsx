import { useState, useEffect } from 'react'
import socket from './socket.js'
import Login from './Login.jsx'
import OwnerView from './OwnerView.jsx'
import DriverView from './DriverView.jsx'
import { useToast, ToastContainer } from './useToast.jsx'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('taxi_user')) } catch { return null }
  })
  const [rides, setRides] = useState([])
  const [connected, setConnected] = useState(false)
  const { toasts, addToast } = useToast()

  // Load rides when user logs in
  useEffect(() => {
    if (!user) return

    fetch(`/api/rides?userId=${user.id}&role=${user.role}`)
      .then(r => r.json())
      .then(setRides)
      .catch(() => addToast('Failed to load rides', 'error'))

    // Connect socket
    socket.connect()

    socket.on('connect', () => {
      setConnected(true)
      if (user.role === 'owner') socket.emit('join:owner')
      else socket.emit('join:driver', user.id)
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('ride:new', (ride) => {
      if (user.role === 'owner') {
        setRides(prev => {
          if (prev.find(r => r.id === ride.id)) return prev
          return [ride, ...prev]
        })
        addToast(`New ride #${ride.id} created`, 'success')
      }
    })

    socket.on('ride:assigned', (ride) => {
      if (user.role === 'driver' && ride.driver_id === user.id) {
        setRides(prev => {
          if (prev.find(r => r.id === ride.id)) return prev.map(r => r.id === ride.id ? ride : r)
          return [ride, ...prev]
        })
        addToast(`New ride assigned: ${ride.pickup} → ${ride.dropoff}`)
      }
    })

    socket.on('ride:updated', (ride) => {
      setRides(prev => prev.map(r => r.id === ride.id ? { ...r, ...ride } : r))
      if (user.role === 'owner') {
        addToast(`Ride #${ride.id}: ${ride.status.replace(/_/g, ' ')}`)
      }
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('ride:new')
      socket.off('ride:assigned')
      socket.off('ride:updated')
      socket.disconnect()
    }
  }, [user])

  const handleLogin = (userData) => {
    localStorage.setItem('taxi_user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('taxi_user')
    setUser(null)
    setRides([])
    socket.disconnect()
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      {/* Top nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🚕</span>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>
            TAXI<span style={{ color: 'var(--yellow)' }}>MGR</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={connected ? 'live-dot' : ''} style={!connected ? { width: 7, height: 7, background: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block' } : {}} />
            <span className="mono" style={{ fontSize: 11, color: connected ? 'var(--green)' : 'var(--text-muted)' }}>
              {connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* User pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '4px 12px',
          }}>
            <span style={{ fontSize: 12 }}>{user.role === 'owner' ? '👑' : '🚗'}</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{user.name}</span>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Page */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px' }}>
        {/* Role header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {user.role === 'owner' ? 'Dispatch Dashboard' : 'My Rides'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
            {user.role === 'owner'
              ? 'Create and manage all rides in real-time'
              : 'Your assigned rides — tap to update status'}
          </p>
        </div>

        {user.role === 'owner' ? (
          <OwnerView user={user} connected={connected} addToast={addToast} rides={rides} setRides={setRides} />
        ) : (
          <DriverView user={user} connected={connected} addToast={addToast} rides={rides} setRides={setRides} />
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
