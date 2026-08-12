function FormField({
  label,
  id,
  type = 'text',
  error,
  disabled,
  ...inputProps
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition',
          'placeholder:text-slate-500',
          'focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error
            ? 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20'
            : 'border-white/10',
        ].join(' ')}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
