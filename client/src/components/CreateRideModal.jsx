import { useState, useEffect } from 'react'

export default function CreateRideModal({ user, onClose, onCreated, addToast }) {
  const [drivers, setDrivers] = useState([])
  const [form, setForm] = useState({
    pickup: '',
    dropoff: '',
    pickup_time: '',
    passenger_name: '',
    passenger_phone: '',
    notes: '',
    driver_id: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/drivers')
      .then(r => r.json())
      .then(setDrivers)
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, created_by: user.id }),
      })
      const data = await res.json()
      if (!res.ok) { addToast(data.error, 'error'); return }
      addToast(`Ride #${data.id} created!`, 'success')
      onCreated(data)
      onClose()
    } catch {
      addToast('Failed to create ride', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }} onClick={onClose}>
      <div
        className="card fade-up"
        style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', borderColor: 'var(--yellow)', borderWidth: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>New Ride</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Pickup Location *</label>
            <input placeholder="e.g. King Fahd Airport, Terminal 1" value={form.pickup} onChange={e => set('pickup', e.target.value)} required />
          </div>
          <div className="field">
            <label>Drop-off Location *</label>
            <input placeholder="e.g. Hilton Hotel, Al Olaya" value={form.dropoff} onChange={e => set('dropoff', e.target.value)} required />
          </div>
          <div className="field">
            <label>Pickup Time *</label>
            <input type="datetime-local" value={form.pickup_time} onChange={e => set('pickup_time', e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Passenger Name</label>
              <input placeholder="Passenger" value={form.passenger_name} onChange={e => set('passenger_name', e.target.value)} />
            </div>
            <div className="field">
              <label>Passenger Phone</label>
              <input placeholder="+966..." value={form.passenger_phone} onChange={e => set('passenger_phone', e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Assign Driver</label>
            <select value={form.driver_id} onChange={e => set('driver_id', e.target.value)}>
              <option value="">— Unassigned —</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Notes</label>
            <textarea
              placeholder="Any special instructions..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating…' : '+ Create Ride'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
