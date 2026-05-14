import { useState } from 'react'
import RideCard from './RideCard.jsx'
import RideDetailModal from './RideDetailModal.jsx'

export default function DriverView({ user, connected, addToast, rides, setRides }) {
  const [selectedRide, setSelectedRide] = useState(null)
  const [filter, setFilter] = useState('active')

  const filteredRides = rides.filter(r => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(r.status)
    return ['completed', 'cancelled'].includes(r.status)
  })

  const activeRide = rides.find(r => ['acknowledged', 'on_the_way', 'picked_up'].includes(r.status))
  const pendingAck = rides.filter(r => r.status === 'created').length

  const handleRideUpdated = (updated) => {
    setRides(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r))
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Driver status card */}
      <div className="card" style={{
        marginBottom: 24,
        background: activeRide
          ? 'linear-gradient(135deg, rgba(245,197,24,0.08) 0%, var(--card) 100%)'
          : 'var(--card)',
        borderColor: activeRide ? 'rgba(245,197,24,0.3)' : 'var(--border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Current Status
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: activeRide ? 'var(--yellow)' : 'var(--text-dim)' }}>
              {activeRide
                ? activeRide.status === 'acknowledged' ? '⏳ Heading Out'
                : activeRide.status === 'on_the_way' ? '🚗 En Route'
                : '🧑 Passenger On Board'
                : '😴 Available'}
            </div>
          </div>
          {pendingAck > 0 && (
            <div style={{ background: 'var(--red)', color: 'white', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
              {pendingAck} new
            </div>
          )}
        </div>
        {activeRide && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>📍 </span>
            <span style={{ fontWeight: 600 }}>{activeRide.pickup}</span>
            <span style={{ color: 'var(--text-muted)' }}> → </span>
            <span style={{ fontWeight: 600 }}>{activeRide.dropoff}</span>
          </div>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', background: 'var(--card)', borderRadius: 'var(--radius)', padding: 3, gap: 2, marginBottom: 16, width: 'fit-content' }}>
        {[
          { key: 'active', label: 'Active' },
          { key: 'done', label: 'Completed' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              background: filter === f.key ? 'var(--yellow)' : 'transparent',
              color: filter === f.key ? 'var(--black)' : 'var(--text-dim)',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rides */}
      {filteredRides.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>☕</div>
          <div style={{ fontWeight: 700 }}>No rides here</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>New assignments will appear instantly</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredRides.map(ride => (
            <RideCard
              key={ride.id}
              ride={ride}
              onClick={() => setSelectedRide(ride.id)}
              highlight={ride.status === 'created'}
            />
          ))}
        </div>
      )}

      {selectedRide && (
        <RideDetailModal
          rideId={selectedRide}
          user={user}
          onClose={() => setSelectedRide(null)}
          onUpdated={handleRideUpdated}
          addToast={addToast}
        />
      )}
    </div>
  )
}
