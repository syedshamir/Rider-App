import { useState, useEffect } from 'react'
import RideCard from './RideCard.jsx'
import CreateRideModal from './CreateRideModal.jsx'
import RideDetailModal from './RideDetailModal.jsx'

const STATUS_ORDER = ['created', 'acknowledged', 'on_the_way', 'picked_up', 'completed', 'cancelled']

export default function OwnerView({ user, connected, addToast, rides, setRides }) {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedRide, setSelectedRide] = useState(null)
  const [filter, setFilter] = useState('active')

  const filteredRides = rides.filter(r => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(r.status)
    if (filter === 'done') return ['completed', 'cancelled'].includes(r.status)
    return true
  })

  const stats = {
    active: rides.filter(r => !['completed', 'cancelled'].includes(r.status)).length,
    completed: rides.filter(r => r.status === 'completed').length,
    unassigned: rides.filter(r => !r.driver_id && r.status === 'created').length,
  }

  const handleRideCreated = (ride) => {
    setRides(prev => [ride, ...prev])
  }

  const handleRideUpdated = (updated) => {
    setRides(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r))
  }

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Active Rides', value: stats.active, color: 'var(--yellow)' },
          { label: 'Completed Today', value: stats.completed, color: 'var(--green)' },
          { label: 'Unassigned', value: stats.unassigned, color: stats.unassigned > 0 ? 'var(--red)' : 'var(--text-muted)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs + create button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'var(--card)', borderRadius: 'var(--radius)', padding: 3, gap: 2 }}>
          {[
            { key: 'active', label: 'Active' },
            { key: 'done', label: 'Done' },
            { key: 'all', label: 'All' },
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
                transition: 'all 0.15s',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Ride
        </button>
      </div>

      {/* Rides list */}
      {filteredRides.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚕</div>
          <div style={{ fontWeight: 700 }}>No rides yet</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>Create your first ride to get started</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredRides.map(ride => (
            <RideCard
              key={ride.id}
              ride={ride}
              onClick={() => setSelectedRide(ride.id)}
              highlight={ride.status === 'created' && !ride.driver_id}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateRideModal
          user={user}
          onClose={() => setShowCreate(false)}
          onCreated={handleRideCreated}
          addToast={addToast}
        />
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
