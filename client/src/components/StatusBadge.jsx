export const STATUS_LABELS = {
  created: 'Created',
  acknowledged: 'Acknowledged',
  on_the_way: 'On the Way',
  picked_up: 'Picked Up',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const STATUS_ICONS = {
  created: '📋',
  acknowledged: '✅',
  on_the_way: '🚗',
  picked_up: '🧑',
  completed: '🏁',
  cancelled: '❌',
}

export function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {STATUS_ICONS[status]} {STATUS_LABELS[status]}
    </span>
  )
}

export function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
    hour12: false
  })
}
