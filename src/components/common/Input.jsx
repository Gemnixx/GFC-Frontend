function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
          {required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? `${name}-message` : undefined}
        className={`h-10 w-full rounded-[var(--radius-md)] border bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)]
          ${
            error
              ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-2 focus:ring-red-100"
              : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
          }
          disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-[var(--color-text-muted)]
          ${className}`}
        {...props}
      />

      {(error || helperText) && (
        <p
          id={`${name}-message`}
          className={`mt-1 text-xs ${
            error
              ? "text-[var(--color-danger)]"
              : "text-[var(--color-text-muted)]"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

export default Input;