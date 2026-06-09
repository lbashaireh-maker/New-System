export default function Spinner({ size = 32 }) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: size * 3 }}>
      <div
        className="rounded-full border-2 border-t-transparent animate-spin"
        style={{ width: size, height: size, borderColor: '#EA8923', borderTopColor: 'transparent' }}
      />
    </div>
  )
}
