function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
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
          {required && (
            <span className="ml-1 text-[var(--color-danger)]">*</span>
          )}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error || helperText ? `${name}-message` : undefined
        }
        className={`h-10 w-full rounded-[var(--radius-md)] border bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors
          ${
            error
              ? "border-[var(--color-danger)] focus:ring-2 focus:ring-red-100"
              : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
          }
          disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-[var(--color-text-muted)]
          ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

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

export default Select;