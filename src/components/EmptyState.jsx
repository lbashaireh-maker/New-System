export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={40} className="mb-3" style={{ color: '#EA8923', opacity: 0.5 }} />}
      <h3 className="text-base font-medium text-gray-600 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400">{description}</p>}
    </div>
  )
}
