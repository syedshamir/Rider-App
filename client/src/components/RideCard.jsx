import { StatusBadge, formatTime } from './StatusBadge.jsx'

export default function RideCard({ ride, onClick, highlight }) {
  return (
    <div
      className="card fade-up"
      onClick={() => onClick && onClick(ride)}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderColor: highlight ? 'var(--yellow)' : 'var(--border)',
        transition: 'border-color 0.2s, transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
        <div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
            RIDE #{ride.id}
          </span>
          {ride.passenger_name && (
            <span style={{ fontWeight: 700, fontSize: 15 }}>{ride.passenger_name}</span>
          )}
        </div>
        <StatusBadge status={ride.status} />
      </div>

      {/* Route */}
      <div style={{
        background: 'var(--dark)',
        borderRadius: 'var(--radius)',
        padding: '12px 14px',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
          <span style={{ fontSize: 14, marginTop: 1 }}>📍</span>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>From</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{ride.pickup}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 14, marginTop: 1 }}>🏁</span>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>To</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{ride.dropoff}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pickup</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--yellow)', marginTop: 2 }}>
              {formatTime(ride.pickup_time)}
            </div>
          </div>
          {ride.driver_name && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Driver</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>🚗 {ride.driver_name}</div>
            </div>
          )}
        </div>
        {ride.passenger_phone && (
          <a
            href={`tel:${ride.passenger_phone}`}
            onClick={e => e.stopPropagation()}
            className="mono"
            style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}
          >
            📞 {ride.passenger_phone}
          </a>
        )}
      </div>

      {ride.notes && (
        <div style={{
          marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)',
          fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic',
        }}>
          💬 {ride.notes}
        </div>
      )}
    </div>
  )
}
