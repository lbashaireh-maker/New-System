const MAP = {
  verified:     { label: 'Verified',     bg: '#DCFCE7', color: '#15803D' },
  pending:      { label: 'Pending',      bg: '#FEF9C3', color: '#A16207' },
  expired:      { label: 'Expired',      bg: '#FEE2E2', color: '#B91C1C' },
  rejected:     { label: 'Rejected',     bg: '#F3F4F6', color: '#4B5563' },
  low:          { label: 'Low',          bg: '#DCFCE7', color: '#15803D' },
  medium:       { label: 'Medium',       bg: '#FEF9C3', color: '#A16207' },
  high:         { label: 'High',         bg: '#FEE2E2', color: '#B91C1C' },
  critical:     { label: 'Critical',     bg: '#FEE2E2', color: '#B91C1C' },
  open:         { label: 'Open',         bg: '#FEE2E2', color: '#B91C1C' },
  acknowledged: { label: 'Acknowledged', bg: '#FEF9C3', color: '#A16207' },
  resolved:     { label: 'Resolved',     bg: '#DCFCE7', color: '#15803D' },
  internal:     { label: 'Internal',     bg: '#EDE9FE', color: '#6D28D9' },
  UN:           { label: 'UN List',      bg: '#FEE2E2', color: '#B91C1C' },
  OFAC:         { label: 'OFAC',         bg: '#FEE2E2', color: '#B91C1C' },
}

export default function Badge({ type, label, size = 'sm' }) {
  const cfg = MAP[type] || { label: type || '', bg: '#F3F4F6', color: '#4B5563' }
  const text = label ?? cfg.label
  const pad  = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${pad}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {text}
    </span>
  )
}
