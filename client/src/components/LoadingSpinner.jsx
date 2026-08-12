function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500/30 border-t-primary-400" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

export default LoadingSpinner
