import { useState, useEffect } from 'react'
import { StatusBadge, STATUS_LABELS, formatTime } from './StatusBadge.jsx'

const NEXT_STATUS = {
  created: null,
  acknowledged: 'on_the_way',
  on_the_way: 'picked_up',
  picked_up: 'completed',
}

export default function RideDetailModal({ rideId, user, onClose, onUpdated, addToast }) {
  const [ride, setRide] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/rides/${rideId}`).then(r => r.json()).then(d => { setRide(d); setLoading(false) })
    if (user.role === 'owner') {
      fetch('/api/auth/drivers').then(r => r.json()).then(setDrivers)
    }
  }, [rideId])

  const updateStatus = async (status) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/rides/${rideId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updated_by: user.id }),
      })
      const updated = await res.json()
      setRide(r => ({ ...r, ...updated, log: [...(r.log || []), { status, timestamp: new Date().toISOString(), updated_by_name: user.name }] }))
      onUpdated(updated)
      addToast(`Status updated: ${STATUS_LABELS[status]}`, 'success')
    } catch {
      addToast('Update failed', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const assignDriver = async (driver_id) => {
    const res = await fetch(`/api/rides/${rideId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_id }),
    })
    const updated = await res.json()
    setRide(r => ({ ...r, ...updated }))
    onUpdated(updated)
    addToast(`Driver assigned: ${updated.driver_name}`, 'success')
  }

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ color: 'var(--yellow)', fontSize: 24 }}>Loading…</div>
    </div>
  )

  const canAcknowledge = user.role === 'driver' && ride.status === 'created'
  const nextStatus = NEXT_STATUS[ride.status]
  const canCancel = user.role === 'owner' && !['completed', 'cancelled'].includes(ride.status)

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={onClose}
    >
      <div
        className="card fade-up"
        style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', borderColor: 'var(--border-light)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>RIDE #{ride.id}</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>
              {ride.passenger_name || 'Unnamed Passenger'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusBadge status={ride.status} />
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Route info */}
        <div style={{ background: 'var(--dark)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <span>📍</span>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pickup</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{ride.pickup}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span>🏁</span>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Drop-off</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{ride.dropoff}</div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Pickup Time', value: formatTime(ride.pickup_time), mono: true, accent: true },
            { label: 'Driver', value: ride.driver_name ? `🚗 ${ride.driver_name}` : '—' },
            { label: 'Phone', value: ride.passenger_phone || '—', mono: true },
            { label: 'Created', value: formatTime(ride.created_at), mono: true },
          ].map(({ label, value, mono, accent }) => (
            <div key={label} style={{ background: 'var(--dark)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
              <div className={mono ? 'mono' : ''} style={{ fontSize: 13, fontWeight: 600, color: accent ? 'var(--yellow)' : 'var(--text)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {ride.notes && (
          <div style={{ background: 'rgba(245,197,24,0.06)', border: '1px solid rgba(245,197,24,0.2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text-dim)' }}>
            💬 {ride.notes}
          </div>
        )}

        {/* Owner: assign driver */}
        {user.role === 'owner' && drivers.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label>Reassign Driver</label>
            <select
              value={ride.driver_id || ''}
              onChange={e => assignDriver(e.target.value)}
              style={{ marginTop: 6 }}
            >
              <option value="">— Unassigned —</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {canAcknowledge && (
            <button className="btn btn-success btn-block" disabled={updating} onClick={() => updateStatus('acknowledged')}>
              ✅ Acknowledge Ride
            </button>
          )}
          {user.role === 'driver' && nextStatus && ride.status !== 'created' && (
            <button className="btn btn-primary btn-block" disabled={updating} onClick={() => updateStatus(nextStatus)}>
              {nextStatus === 'on_the_way' && '🚗 On the Way'}
              {nextStatus === 'picked_up' && '🧑 Picked Up'}
              {nextStatus === 'completed' && '🏁 Complete Ride'}
            </button>
          )}
          {canCancel && (
            <button className="btn btn-danger btn-sm" disabled={updating} onClick={() => { if (confirm('Cancel this ride?')) updateStatus('cancelled') }}>
              ✕ Cancel
            </button>
          )}
        </div>

        {/* Status timeline */}
        {ride.log && ride.log.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
              Timeline
            </div>
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              <div style={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
              {ride.log.map((entry, i) => (
                <div key={i} style={{ position: 'relative', marginBottom: 14, paddingLeft: 12 }}>
                  <div style={{ position: 'absolute', left: -14, top: 4, width: 8, height: 8, borderRadius: '50%', background: i === ride.log.length - 1 ? 'var(--yellow)' : 'var(--border-light)', border: '2px solid var(--dark)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <StatusBadge status={entry.status} />
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>
                  {entry.updated_by_name && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, marginLeft: 2 }}>
                      by {entry.updated_by_name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
